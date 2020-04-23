<!--
 * @Author: monai
 * @Date: 2020-04-23 21:51:38
 * @LastEditors: monai
 * @LastEditTime: 2020-04-23 21:51:38
 -->
javascript 是一门单线程的脚本语言，虽然是单线程但是有很多异步的API来帮助开发者解决线程的阻塞问题。比如：`onClick` 注册的回调函数、必不可少的 `ajax` 等等...但是 javascript 
运行环境是如何做到单线程却又不是一直阻塞线程等待各种异步操作完成才继续执行操作的呢？

答案就是：*event loop*

> event loop 的规范是在HTML5中规定的  
> event loop 是 javascript 运行环境(手动加粗) 的机制。
> 浏览器实现的event loop 与 NodeJS 实现的event loop 是有异同的。  
> HTML5 中定义[event loop 规范链接](https://www.w3.org/TR/html5/webappapis.html#event-loops)

## **一 浏览器的event loop**

### **1.简单了解**

event loop 即事件循环，它到底是什么结构呢？ 阮一峰老师的博客有一张图，虽然很直白、明了但是少了一些东西不能全面的将 event loop 整体循环机制展示出来。先来看图：

![](https://www.ismoon.cn/static/3ff262022c4d1ec0aa3dc0713f2a282e.min.600.png)

**_图片非笔者原创，来自阮一峰博客，在此说明，侵删。_**


从图中我们可以得到信息是：
> 1.javascript 引擎执行 javascript 是单线程的，因为只有一个 stack 里面有各种正在执行、等待执行的事件。
> 2.有一些 webAPI 将执行时产生的 callback 放入一个队列，即 “事件队列”。
> 3.在event loop 循环中不停的将“事件队列”里等待执行的事件，推入 javascript 执行栈。

这就是事件循环简化的机制，为什么说简化呢？因为在循环中还做了很多没有提及的操作、规则。

我就不举栗子了，但是我要打个比方。

![](https://www.ismoon.cn/static/e9498463a7bad39b51732c5ddc88c2ae.jpg)
![](https://www.ismoon.cn/static/59b3a9dc35c1b6612873170f6819bafd.png)

就说一个老生常谈的问题;
```javascript
setTimeout(e=>{ console.log(1) },0);

new Promise((res, rej)=>{ res() }).then(e=>{ console.log(2) });
```
同样都是 javascript 中提供的异步API，同样都是直接执行，但是不论这俩行代码谁上、谁下，输出都会是**2 1**。因为这里涉及 event loop 中**macro task**与**micro task**的执行顺序、规则。

### **2.整体流程**
回到刚才说那张流程图不够完善的问题上，现在来一张完整的、全面的 event loop 流程图。

![](https://www.ismoon.cn/static/1bb0d78ac8de54dab78c8cc9b2cca3cd.jpg)

**_图片非笔者原创，来secrets of javascript ninja，在此说明，侵删。_**

这是一个 event loop 完整的流程图，从图中我们看到了许多刚才未提及的名词，从头到尾的梳理一遍 (从上至下)：

1.读取 Macrotask queue 中任务。有两种情况：
1.1 任务队列空，向下执行。
1.2 任务队列不为空，将最先进入的 **一个** 任务推入 javascript 执行栈，向下执行。

2.读取 Microtask queue 中任务。有两种情况：
2.1 任务队列空，向下执行。
2.2 任务队列不为空，将最先进入的一个任务推入 javascript 执行栈，并且**再次重复此操作**，直到 Microtask queue 为空。直白的说：**将此任务队列按照先后顺序将所有任务推入javascript 执行栈，向下执行**。

3.根据**本次循环耗时**判断**是否需要**、**是否可以**更新UI 【 后面会提一下这个循环时间问题 】。

1.不需要，重复第一步。
2.需要，向下执行。

4.更新UI，UI rendering，同时阻塞 javascript 执行。并且继续重复第一步。

以上便是一整个 event loop 流程，从流程中我们可以看到有俩个“任务队列”，这俩个队列实例化到 javascript 中的API 便是：
1. Macrotask queue --> `setTimeout` || `setInterval` || javascript代码
2. Microtask queue --> `Promise.then()`

至此一个完整的 event loop 流程便完全说完了。

### 3.实例解析
现在回到刚才提到的 “老生常谈的问题” 从实例的角度来说明一下问题。我们假设这个 javascript 文件叫做 `main.js`，`main.js`中的代码（+ 为自定义标记）

```javascript
+1 console.log(1);

+2 setTimeout(e=>{ console.log(2); },0)

+3 setTimeout(e=>{ console.log(3); },0)

+4 new Promise((resolve,reject)=>{ console.log(4); resolve();})
.then(e=>{ console.log(5); })

+5 setTimeout(e=>{ 
    console.log(6);

    +6 new Promise((resolve,reject)=>{ console.log(7); resolve(); }).then(e=>{ console.log(8);})
})
```

那么这个执行顺序是怎样呢？从头带尾梳理一遍（词穷，全文只要是流程统一是“从头到尾梳理一遍”）

> **macrotask:** javascript 代码，所有同步代码执行。输出：**1 4**。注册 **+4** 到 microtask。 注册 **+2 +3 +5** 到 macrotask。
> 
> **microtask:** 执行 **+4** 输出：**5**。
> 
> **macrotask:** 执行 **+2** 输出**2**。
> **microtask:** 无
> 
> **macrotask:** 执行 **+3** 输出**3**。
> **microtask:** 无
> 
> **macrotask:** 执行 **+5** 输出**6 7**。 注册 +6 到 microtask。
> **microtask:** 输出**8**。

所以总体输出的顺序为：**1 4 5 2 3 6 7 8**

如果这个输出与你所想相同，那么基本就没有问题了。那么如果不对或者有问题怎么办？

![](https://www.ismoon.cn/static/786d431718e09a169b18e24335b03172.jpg)

PS： 前面提到 【**本次循环耗时**】这个问题，这里我也不是非常清楚，望大牛指点。浏览器一般渲染页面60/S，以达到每秒60帧（60 fps），所以大概16ms一次，既然有了时间我们不经就会问？前面的任务处理耽误了则么办？因为javascript线程与UI线程互斥，某些任务导致 javascript引擎 坑了队友，自然而然没法在16ms的节点上到达这一步，从secrets of javascript ninja中了解到，一般会摒弃这次渲染，等待下一次循环。（ 如有问题请指正！ ）

浏览器中的 event loop 到此结束，下面说说 NodeJS 的 event loop

## **二 NodeJS 的 event loop**

NodeJS 的 event loop 也是有**Macrotask queue 与 Microtask queue**的。只不过 NodeJS 的略有不同。那么主要说说不同在哪里。NodeJS中 **Macrotask queue** 与 **Microtask queue** 实例化到API为：

>  Macrotask queue --> script(主程序代码)，setImmediate, I/O，setTimeout, setInterval
> 
>  Microtask queue --> process.nextTick, Promise

### **1.Macrotask queue 不同之处**
上面说到了浏览器 event loop 的 Macrotask queue 在每次循环中只会读取一个任务,NodeJS 中 Macrotask queue 会一次性读取完毕（**同阶段的执行完毕，后面会说到Macrotask queue 分为 6个阶段**），然后向下读取Microtask。

> 注意： 这一条与NodeJS版本有很大关系，在看 深入浅出NodeJS这一本书时（ 看的版本很旧，不知是否有修订版，如有请告知。 ），提到的setImmediate每次循环只会执行一次，并且给出的示例在v8.9.1版本跑时已不符合书中所写。书中示例如下（+ 为自定义标记，原文中没有）：
```javascript
+1  process.nextTick(function () {
        console.log('nextTick执行1');
    });

+2  process.nextTick(function () {
        console.log('nextTick执行2');
    });

+3 setImmediate(function () {
    console.log('setImmediateჽ执行1');

 +4 process.nextTick(function () {
        console.log('强势插入');
    });
});

+5 setImmediate(function () {
    console.log('setImmediateჽ执行2');
});

+6 console.log('正常执行');

// 正常执行
// nextTick执行1
// nextTick执行2
// setImmediate执行1
// 强势插入
// setImmediateჽ执行2
```
在 v8.9.1 中截图如下

![](https://www.ismoon.cn/static/c3e2d43cc75442d685a9d1b0c2e71315.png)

从图片中可以看到，至少在 v8.9.1 版本中 Macrotask queue 会直接全部执行。按照惯例**从头到尾的梳理一遍**：
> **macrotask:** javascript 代码，所有同步代码执行。输出：**正常执行**。注册 +3 +5 到 Macrotask。执行process.nextTick()，最终输出：**正常执行， nextTick执行1， nextTick执行2。
> **microtask:** 无
> 
> **macrotask:** 执行 +3 +5。 输出：**setImmediate执行1， setImmediateჽ执行2。**执行process.nextTick()，最终输出：**setImmediate执行1， setImmediateჽ执行2，强势插入。**
> **microtask:** 无

所以最终输出为：**正常执行， nextTick执行1， nextTick执行2，setImmediate执行1， setImmediateჽ执行2，强势插入。**

### 2.process.nextTick(),setImmediates，以及event loop的6个阶段 ### 

NodeJS 中**Macrotask queue**会分为 6 个阶段，每个阶段的作用如下（**process.nextTick()**在6个阶段结束的时候都会执行）：

> timers：执行setTimeout() 和 setInterval()中到期的callback。
> 
> I/O callbacks：上一轮循环中有少数的I/Ocallback会被延迟到这一轮的这一阶段执行
> 
> idle, prepare：仅内部使用
> 
> poll：最为重要的阶段，执行I/O callback，在适当的条件下会阻塞在这个阶段
> 
> check：执行setImmediate的callback
> 
> close callbacks：执行close事件的callback，例如socket.on('close',func)

> 注：此6个阶段非笔者原创来自[不要混淆浏览器于NodeJS EventLoop](https://cnodejs.org/topic/5a9108d78d6e16e56bb80882)，文章从底层C代码分析NodeJS event loop。这里做只做简单整合。侵删。

在了解了这六个阶段后，我们可以发现定时器系列在NodeJS event loop中 Macrotask queue 读取顺序为：

1. setTimeout(fun,0) setInterval(fun,0) 
2. setImmediate

空口无凭，在实例中了解。的代码奉上（ 代码较长 ）：
```javascript
+1 process.nextTick(function(){
    console.log('1');
});
+2 process.nextTick(function(){
    console.log('2');
    +3 setImmediate(function(){
        console.log('3');
    });
    +4 process.nextTick(function(){
        console.log('4');
    });
});

+5 setImmediate(function(){
    console.log('5');
    +6 process.nextTick(function(){
        console.log('6');
    });
    +7 setImmediate(function(){
        console.log('7');
    });
});
+8 setTimeout(e=>{
    console.log(8);
    +9 new Promise((resolve,reject)=>{
        console.log(8+'promise');
        resolve();
    }).then(e=>{
        console.log(8+'promise+then');
    })
},0)

+10 setTimeout(e=>{ console.log(9); },0)

+11 setImmediate(function(){
    console.log('10');
    +12 process.nextTick(function(){
        console.log('11');
    });
    +13 process.nextTick(function(){
        console.log('12');
    });
    +14 setImmediate(function(){
        console.log('13');
    });
});

console.log('14');

+15 new Promise((resolve,reject)=>{
    console.log(15);
    resolve();
}).then(e=>{
    console.log(16);
})
```
这么复杂的异步嵌套在一起是不是很头疼呢？
**我！不！看！了！**  

![](https://www.ismoon.cn/static/4aa87bc7b70667d7218d05b8ebfbe5c4.jpg)

最后一遍梳理，最多、最全的一次梳理。
> **macrotask:**javascript 代码，所有同步代码执行。输出：**14**。执行process.nextTick()，最终输出：**14，15， 1， 2， 4。**注册 +3 +5 +8 +11 到 Macrotask。 注册 +15 到 Microtask。
> **microtask:**执行 +15 输出 16

> **macrotask:**执行 +8 +10 输出**8， 8promise， 9。**注册 +9 到 Microtask。
> **microtask:**执行 +9 输出**8promise+then**

> **macrotask:**执行 +5 +11 +3 输出 5， 10， 3。 注册 +7 +14 到**macrotask**。执行process.nextTick()，最终输出：**5 10 3 6 11 12。**
> **microtask:**无



> **macrotask:**执行 +7 +14。 输出：**7，13**
> **microtask:**无

由此最中全部的输出为：**14，15，1，2，4，8，8promise，9，8promise+then，5，10，3，6，11，12，7，13**

## **三 结束**

到此结束了。浏览器的、NodeJS 的 event loop 已全部分析完成，过程中引用：阮一峰博客，知乎，CSDN部分文章内容，侵删。

最近在了解部分底层知识，收获颇丰。其中包括 for of.... 等等各种奇奇怪怪的问题，有时间再写吧。

**segmentfault同步的链接为：**

[<font color="#46acc8">https://segmentfault.com/a/1190000015552098</font>](https://segmentfault.com/a/1190000015552098)