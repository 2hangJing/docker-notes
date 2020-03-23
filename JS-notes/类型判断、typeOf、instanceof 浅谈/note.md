<!--
 * @Author: monai
 * @Date: 2020-03-23 17:36:49
 * @LastEditors: monai
 * @LastEditTime: 2020-03-23 18:19:55
 -->
# JS 数据类型判断

常用的typeOf、instanceof、Object.prototype.toString.call()，其中Object.prototype.toString.call() 效果最好，基本类型、内置对象多能区分出来。


## typeof  
typeof 可以判断出很多数据类型，但是到 null 和部分内置对象得时候就会显得无力，代码如下:

```javascript
    typeof null; //"object"
    typeof [1]; //"object"
```
为什么typeof null; 会返回 ”object“呢？  
因为：js 在底层存储变量的时候，会在变量的机器码的低位1-3位存储其类型信息：
* 000 对象
* 100 字符串
* 110 布尔
* .....

而 null 的机械码全部是0，所以 typeof 在判断 null 的时候会出现”object“的错误问题。

## instanceof  
instanceof 语法是判断：右边参数的 prototype 是否在左边参数的原型链上（`__proto__`）。**注意：右边的参数如果没有 prototype，只有 `__proto__` 那么会JS报错，报错提示如下：**  
**Uncaught TypeError: Right-hand side of 'instanceof' is not callable**  

判断的方法如此，那么就有很多有趣的判断，示例：  

```javascript
    Object instanceof Object // true
    Function instanceof Function // true
    Function instanceof Object // true
```
首先放张原型链的图：
![原型链图](./原型链.png)
### Object instanceof Object
```javascript
    Object.__proto__ == Function.prototype
    Function.prototype.__proto__ == Object.prototype 
    Object instanceof Object // true
```
### Function instanceof Function
```javascript
    Function.__proto__ == Function.prototype
    Function instanceof Function // true
```
### Function instanceof Object
```javascript
    Function.__proto__ == Function.prototype
    Function.prototype.__proto__ == Object.prototype 
    Object instanceof Object // true
```

## Object.prototype.toString.call()  
Object.prototype.toString.call() 判断的最为齐全，可以直接判断出是哪些类型。  
Object.prototype.toString 方法是JS中内置的获取 `ES5: [[clasee]] ES6:internal slot ` 类型的方法，也是唯一的方法。  
Object.toString 方法返回的是一个函数，而 Object.prototype.toString 则是返回`[object xxx]`这样的字符串。  
**注意：Array、String 等toString 都会返回类似 "function Date() { [native code] }"，而 Math.toString() 则会直接返回 "[object Math]"**
示例：
```javascript
    Error.toString();
    // "function Error() { [native code] }"
    
    let err = new Error();
    Object.prototype.toString.call(err);
    // "[object Error]"

    Math.toString();
    // "[object Math]"
```