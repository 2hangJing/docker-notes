<!--
 * @Author: monai
 * @Date: 2021-08-03 13:48:38
 * @LastEditors: monai
 * @LastEditTime: 2021-08-30 16:39:01
-->
# Vue3 响应式原理解析【第一期】

## 一、简介

Vue 的核心原理之一便是“响应式”，那么所谓的“响应式”到底是什么？由代码引出问题：
``` javascript
//  添加 响应式副作用
const reactUserInfo = reactive({ name: 'zhang3' }); 
// 立即输出 'zhang 3'
watchEffect(()=> console.log( reactUserInfo.name )) 
//  watchEffect 再次执行，输出： li 4
reactUserInfo.name = 'li 4'; 
```
看似“理所应当”的代码其实是 Vue “响应式” 提供了基础。 但是细想一下 `watchEffect` 这样一个函数是如何做到根据 `reactUserInfo.name` 变化而‘响应’的呢？

## 二、原理
### 1. Proxy 与 Object.defineProperty()
> `Proxy` 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”（meta programming），即对编程语言进行编程。  
> -- by【ECMAScript 6 入门】阮一峰

`Proxy` 与 `Object.defineProperty()` 优劣如下表格：

|     | 支持操作的种类（MDN 为准） | 是否支持捕获嵌套属性 | 劫持层面 | 是否支持捕获内置对象的操作方法（eg: push\unshift...） | 
|  ----  | ----  | ----  | ----  | ----  |
| Proxy  | 13种，getter\setter\delete\in\new ... | 不支持 | 整个对象 | 支持 |
| defineProperty  | 2种，getter\setter | 不支持 | 单一属性 | 不支持 |

### 2. 响应式基础
“响应式”的基础是由: `reactive、track、trigger、effect` 组成，由此扩展而来的API有：`watch、watchEffect、computed` 等等。

总体关系得流程图如下【精简】：
![](http://www.ismoon.cn/static/b31b2c9bca91266b376ae1538494b215.jpg)

涉及到的全局变量：
``` javascript
//  当前激活的 effect 函数
let activeEffect;
//  { 响应式对象: effect } MAP
const targetMap = new WeakMap();
//  当前需要执行的 effect 栈
const effectStack;
```

#### 1. reactive
`reactive` 函数得作用主要就是通过`proxy`产生一个 `target object` 的代理对象: 
1. 拦截 `get 执行 track 收集`。
2. 拦截 `set 执行 trigger 触发`。

源码如下：
``` javascript
const reactive = obj =>{

    let proxyOptions = {
        get(target, propKey){
            //  收集
            track(target, propKey);

            return Reflect.get(target, propKey);
        },
        set(target, propKey, value){
            //  赋值，赋值完毕后 调用 trigger，此时 trigger中有获取当前值时，已为最新值。
            const result = Reflect.set(target, propKey, value);
            //  触发 effect
            trigger(target, propKey);

            return result;
        }
    };
    return new Proxy(obj, proxyOptions);
};
```
##### 2. track
`track` 函数的主要作用就是收集，收集 `target propKey` 更改时要触发的 `effect` 函数。

源码如下：
``` javascript
const track = (target, propKey)=>{
    //  不存在当前激活的 activeEffect，代表当前触发 getter的不是 effect 函数
    if(activeEffect === undefined)return;
    //  获取当前 target 对应的所有 key 对应的 effect Map 
    let depsMap: Map<string, Set<TYPE_effect>> | undefined = targetMap.get(target);
    //  所有 target map中不存在当前的 target，
    if(!depsMap){

        depsMap = new Map<string, Set<TYPE_effect>>();
        
        targetMap.set(target, depsMap);
    }
    //  当前 propKey 对应的 effect set
    let dep: Set<TYPE_effect> | undefined = depsMap.get(propKey);

    if(dep === undefined){
        dep = new Set();
        depsMap.set(propKey, dep);
    }
    //  propKey 对应的 dep 中不包含当前触发 getter 的 effect。
    if(!dep.has(activeEffect)){
        //  收集 effect 
        dep.add(activeEffect)
    }
}
```
##### 3. trigger
`trigger` 函数的主要作用是触发，当 `target propKey` 修改时触发代理对象的 `set` 从而调用已经收集的`effect` 函数。

源码如下：
``` javascript
const trigger = (target, propKey)=>{

    let depsMap: Map<string, Set<TYPE_effect>> | undefined = targetMap.get(target);

    if(depsMap === undefined)return;

    let dep: Set<TYPE_effect> | undefined = depsMap.get(propKey);

    if(dep === undefined) return;
    //  收集了当前 key 的 effect，全部触发一遍
    dep.forEach(effect=> {
        if(effect.options.scheduler){
            effect.options.scheduler(effect);
        }else{
            effect();
        }
    });
}
```


### 参考
https://juejin.cn/post/6859271079764951047#heading-0
https://bearcub.club/2020/05/09/vue3-0-reactivity%E8%AF%A6%E8%A7%A3/#track
https://zhuanlan.zhihu.com/p/346256248
https://segmentfault.com/a/1190000023344847
https://segmentfault.com/a/1190000040187661
https://lq782655835.github.io/blogs/vue/vue3-code-3.api-analysis.html
https://vue3js.cn/reactivity/reactive.spec.html
