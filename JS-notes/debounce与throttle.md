<!--
 * @Author: monai
 * @Date: 2021-09-01 15:12:13
 * @LastEditors: monai
 * @LastEditTime: 2021-09-01 16:54:42
-->
# 函数防抖和节流

## 1. 函数防抖 debounce
**作用：在事件被触发n秒后再执行回调，如果在这n秒内又被触发，则重新计时。**

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
