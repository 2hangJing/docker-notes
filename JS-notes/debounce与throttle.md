<!--
 * @Author: monai
 * @Date: 2021-09-01 15:12:13
 * @LastEditors: monai
 * @LastEditTime: 2021-09-06 10:17:31
-->
# 函数防抖和节流

## 1. 函数防抖 debounce
**作用：在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。**
> **此方式列举 context 动态传入与不传入两种方式，后面示例不再展示**
 - **Ⅰ、传入 context 方式**
```javascript
// 通过闭包缓存 `timeId`
function debounce(fn, timer){
    let timeId;
    return (context, ...arg)=>{
        timeId && clearTimeout(timeId);
        timeId = setTimeout(()=>{
            
            fn.apply(context, arg);
        }, timer)
    }
};
//  测试用例
let logFunc = debounce(function(num1, num2){
    console.log(num1, num2); // 123 456
    console.log(this); // #document
}, 1000);
document.addEventListener('mousemove', function(e){
    logFunc(this, 123, 456);
});
```
 - **Ⅱ、this 传递方式**
```javascript
// 通过闭包缓存 `timeId`
function debounce(fn, timer){
    let timeId;
    //  箭头函数在定义时确定 this，此处是同 function 定义保留 this 动态指向
    return function(...arg){
        timeId && clearTimeout(timeId);
        timeId = setTimeout(()=>{
            fn.apply(this, arg);
        }, timer)
    }
};
//  测试用例
let logFunc = debounce(function(e){
    console.log(e); // event
    console.log(this); // #document
}, 1000);
//  直接绑定 debounce 返回函数，从而使 this 传递进来。
document.addEventListener('mousemove', logFunc);
```
## 2. 函数节流 throttle
**作用：每隔一段时间，只执行一次函数。**

- 1. 使用时间戳
```javascript
function throttle(fn, timer){
    let timeStamp = 0;
    return function(context, ...arg){
        let currentTime = Date.now();
        if(currentTime - timeStamp <= timer)return;
        timeStamp = currentTime;
        fn.apply(context, arg);
    }
};
//  测试用例
let logFunc = throttle(function(num1, num2){
    console.log(num1, num2);
    console.log(this);
}, 1000);
document.onmousemove = function (e) {
    logFunc(this, 456, 123);
}
```

- 2. 使用定时器
```javascript
function throttle(fn, timer){
    let timeId;
    return function(context, ...arg){
        if(timeId)return;
        timeId = setTimeout(()=>{
            fn.apply(context, arg);
            timeId = undefined;
        }, timer);
    }
};
//  测试用例
let logFunc = throttle(function(num1, num2){
    console.log(num1, num2);
    console.log(this);
    console.log(new Date().toLocaleString());
}, 1000);
document.onmousemove = function (e) {
    logFunc(this, 456, 123);
}
```
