<!--
 * @Author: monai
 * @Date: 2020-04-19 22:39:29
 * @LastEditors: monai
 * @LastEditTime: 2020-04-19 22:45:20
 -->
## 一、forEach 循环中删除、增加元素引发的思考

平时开发中 ES6+ 使用越来越多，`forEach` 逐渐淡出视野。今天用 `forEach` 遍历的时候遇到了原数组 `push` 操作，结果发现 `push` 操作对 `forEach` 遍历原数组没有影响，特地去 MDN 看了一下，真是白用了三年啊。

[MDN-forEach](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)

> 1. `forEach` 遍历的范围在第一次调用 `callback` 前就会确定，调用 `forEach` 后添加到数组中的项不会被 `callback` 访问到。
> 
> 2. 如果已经存在的值被改变，则传递给 `callback` 的值是 `forEach` 遍历到他们那一刻的值。
> 
> 3. 已删除的项不会被遍历到。
> 
> 4. 如果已访问的元素在迭代时被删除了（例如使用 `shift()`），之后的元素将被跳过

现在来 code 验证一下

**对标号1验证**
```javascript
[9,9,9,9].forEach((val,index,arr)=>{

    arr.push(8);

    console.log(val);
})

// 9 * 4
```
在遍历时对原数组添加元素最终只循环了 **4** 次，并且输出 **9 * 4**，每次添加的 **8** 没有呗遍历。 由此可见 **1** 没错。

**对标号2验证**
```javascript
[9,9,9,9].forEach((val,index,arr)=>{

    arr[index+1] = index;

    console.log(val);
})

// 9 0 1 2
```
遍历开始便修改后续的元素值，当遍历到对应元素时，当前值已被修改。

**对标号3验证**
```javascript
[9,9,9,9].forEach((val,index,arr)=>{

    arr.pop();

    console.log(val);
})
// 9 * 2
```
遍历开始后弹出末尾元素，循环只进行了 2 此。

**对标号4验证**
```javascript
['a','b','c','d','e','f'].forEach((val,index,arr)=>{
    arr.shift();

    console.log(val);
})

// a c e
```
遍历开始后对数组首位元素进行弹出，**val : a, index : 0**

当第一轮循环后原数组变为 **[b,c,d,e,f]**

第二轮时 **val : c, index: 1**

...

由此可以看出，**当 `forEach` 循环时前面的元素被删除后当前的 `index` 索引不变，每次寻找的元素都是原数组，所以就会造成这种中间隔着一个字母的现象。**

再次用 `splice` 验证一下
```javascript
[10,20,30,40,50,60,70].forEach((val,index,arr)=>{

    arr.splice(0,2);

    console.log(val);
})
// 10 40 70
```
遍历开始后对数组首位元素进行弹出，**val : 10, index : 0**

当第一轮循环后原数组变为 **[30,40,50,60,70]**

第二轮时 **val : 40, index: 1**

...

上面代码验证后的确如此。

一个 `array` 的方法，深究也有不少学问。

**记录于**

**2019 /3 /18**