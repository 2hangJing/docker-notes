<!--
 * @Author: monai
 * @Date: 2020-03-23 17:36:49
 * @LastEditors: monai
 * @LastEditTime: 2023-02-08 14:29:02
 -->
# JS 数据类型判断

判断类型主要用 `typeOf` `instanceof` `Object.prototype.toString`，其中 `Object.prototype.toString` 效果最好，基本类型、内置对象都能区分出来。


## 1. `typeof`
`typeof` 可以判断出很多数据类型，但是到 `null` 和部分内置对象得时候就会显得无力，代码如下:

```javascript
    typeof null;    // 'object'
    typeof [1];     // 'object'
```
为什么 `typeof null;` 会返回 `'object'` 呢？  
因为：js 在底层存储变量的时候，会在变量的机器码的低位1-3位存储其类型信息：
* 000 对象
* 100 字符串
* 110 布尔
* .....

而 `null` 的机械码全部是0，所以 `typeof` 在判断 `null` 的时候会出现 `'object'` 的错误问题。

`typeof` 可以返回一下的值：

| 类型 | 示例 | 返回值 |
| ---- | ---- |---- |
| 字符串 | typeof 'abc' | string |
| 数  值 | typeof 123 | number |
| 布  尔 | typeof true | boolean |
| Function | typeof function(){} | function |
| Undefined | typeof undefined | undefined |
| BigInt | typeof BigInt(1); | bigint |
| Symbol | typeof Symbol('1'); | symbol |
| null | typeof null | object |
| Map | typeof new Map(); | object |
| Set | typeof new Set();  | object |
| Array | typeof [] | object |
| Object | typeof {} | object |

## 2. `instanceof`  
`instanceof` 是判断：右边参数的 `prototype` 是否在左边参数的原型链上（`__proto__`）。

**注意：右边的参数如果没有 `prototype`，只有 `__proto__` 那么会JS报错：Uncaught TypeError: Right-hand side of 'instanceof' is not callable**  

判断的方法如此，那么就有很多有趣的判断，示例：  

```javascript
Object instanceof Object        // true
Function instanceof Function    // true
Function instanceof Object      // true
```
首先放张原型链的图：
![原型链图](https://ismoon.cn/static/images/1675836159252-%E5%8E%9F%E5%9E%8B%E9%93%BE.min.600.png)
**解析：`Object instanceof Object`**
```javascript
Object.__proto__ == Function.prototype
Function.prototype.__proto__ == Object.prototype 
Object instanceof Object // true
```
**解析：`Function instanceof Function`**
```javascript
Function.__proto__ == Function.prototype
Function instanceof Function // true
```
**解析：`Function instanceof Object`**
```javascript
Function.__proto__ == Function.prototype
Function.prototype.__proto__ == Object.prototype 
Object instanceof Object // true
```

## 3. `Object.prototype.toString`

#### 1. `toString` 原理

`Object.prototype.toString` 更加精准，及时是内置对象也能给出正确类型值。同时也是 JS 中获取内置 `[[clasee]]（ES5）` `Symbol.toStringTag（ES6）` 属性的方法，调用时原理如下：

1. `this` 为 `undefined`， 返回 `[object Undefined]`。
2. `this` 为 `null`， 返回 `[object null]`。
3. `this` 通过 `ToObject()` 方法强制转换为 `Object` 类型，返回对象 `O`。（与 `Object` 强制转换逻辑相同）
4. `O` 存在 `IsArray()` 方法，且该方法返回 `true`，创建 `builtinTag` 变量并赋值为 `'Array'`。
5. `O` 存在 `[[ParameterMap]]` 插槽，创建 `builtinTag` 变量并赋值为 `'Arguments'`。
6. `O` 存在 `[[Call]]` 插槽，创建 `builtinTag` 变量并赋值为 `'Function'`。
7. `O` 存在 `[[ErrorData]]` 插槽，创建 `builtinTag` 变量并赋值为 `'Error'`。
8. `O` 存在 `[[BooleanData]]` 插槽，创建 `builtinTag` 变量并赋值为 `'Boolean'`。
9. `O` 存在 `[[NumberData]]` 插槽，创建 `builtinTag` 变量并赋值为 `'Number'`。
10. `O` 存在 `[[StringData]]` 插槽，创建 `builtinTag` 变量并赋值为 `'String'`。
11. `O` 存在 `[[DateValue]]` 插槽，创建 `builtinTag` 变量并赋值为 `'Date'`。
12. `O` 存在 `[[RegExpMatcher]]` 插槽，创建 `builtinTag` 变量并赋值为 `'RegExp'`。
13. 以上都不符合，创建 `builtinTag` 变量并赋值为 `'Object'`。
14. 创建 `tag` 变量并赋值为 `Symbol.toStringTag` 属性值。
15. `tag` 变量不是字符串类型，则 `tag` 被赋值为 `builtinTag`。
16. 拼接字符串并返回 `'[object + tag + ']'`。

> [TC39 ECMAScript Object.prototype.tostring]

根据原理可以看出来 `toString` 在调用时获取 `this` 上 `[[class]]` 以及 `Symbol.toStringTag` 属性来返回类型字符串的，这也解释了为什么开发中需要 `call` 调用。

普通对象的 `toString` 方法继承自 `Object` 对象，从而返回一个表示该对象字符串：`'[object xxx]'`，但是大部分内置对象此方法都被覆写了，比如 `Array`。
```javascript
const arr = [1,2,3];
arr.toString(); // '1,2,3' 
```
**`JSON` `Math` `Atomics` 这三个对象的 `toString()` 方法都没有被重写，示例：**  

```javascript
JSON.toString();
// '[object JSON]'
Math.toString();
// '[object Math]'
Atomics.toString();
// '[object Atomics]'
```

#### 2. 内置插槽 Internal-slots

`[[class]]` 为部分对象的的内置插槽，代表类型值。关于内置插槽 ECMAScript 规范文档上有几个关键说明：

> **Internal slots are not object properties and they are not inherited.**
> 内部槽不是对象属性，也不是继承的。

> **Unless explicitly specified otherwise, internal slots are allocated as part of the process of creating an object and may not be dynamically added to an object.**
> 除非有显式指定，否则内部槽将作为创建对象过程的一部分分配，并且不能动态地添加到对象中。

> [TC39 ECMAScript Internal-slots]

有如下示例：
```javascript
const b = new Boolean(true);
b.__proto__ = Object.prototype;
Object.prototype.toString.call(b);  // '[object Boolean]'
```
上述代码中虽然修改了 `b` 的原型链，但是其内部插槽的值并不能被动态修改，所以依然返回 `'[object Boolean]'`。

再来看一个示例：
```javascript
Object.prototype.toString.call(String.prototype);   // '[object String]'
```
`prototype` 无疑是一个对象那为什么类型不是 `'[object Object]'` 呢？

TC39 ECMAScript 文档 [TC39 ECMAScript String-prototype] 给出了答案：

> 22.1.3 Properties of the String Prototype Object
> The String prototype object:
> 1. ...
> 3. **has a \[[StringData]] internal slot whose value is the empty String.** 

同理 `Number.prototype` `BigInt.prototype` `Symbol.prototype` ... 都是返回对应类型。

#### 3. `Symbol.toStringTag`

通过 `Object.prototype.toString` 原理可以发现 `Symbol.toStringTag` 优先级更高，设置了 `Symbol.toStringTag` 属性后会使 `[[class]]` 失效。

`Symbol.toStringTag` 属性存在原型链中，示例：
```javascript
const a = Object(BigInt(1));
console.log(a);
// [[Prototype]]: BigInt
    // ...
    // Symbol(Symbol.toStringTag): "BigInt"
// [[PrimitiveValue]]: 1n
```

`[Symbol.toStringTag]` 属性可以被修改。示例：
```javascript
const arr = new Array();
Object.prototype.toString.call(arr); // [object Array]

arr[Symbol.toStringTag] = 'arr';
Object.prototype.toString.call(arr); // [object arr]
```

> `Symbol.toStringTag` 定义以及用途 [MDN toStringTag]

**特殊示例：** 
```javascript
const a = Object(BigInt(1));
Object.prototype.toString.call(a);
//  '[object BigInt]'

const a = Object(BigInt(1));
a.__proto__ = Object.prototype;
Object.prototype.toString.call(a);
// '[object Object]'
// 解析
// BigInt 有 Symbol.toStringTag 属性，toString 获取后返回。修改原型链后，Symbol.toStringTag 属性丢失，返回 Oject。
```


## 参考
1. [MDN toStringTag]
2. [TC39 ECMAScript Object.prototype.tostring]

[MDN toStringTag]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag
[TC39 ECMAScript Object.prototype.tostring]: https://tc39.es/ecma262/#sec-object.prototype.tostring
[TC39 ECMAScript Internal-slots]: https://tc39.es/ecma262/#sec-object-internal-methods-and-internal-slots
[TC39 ECMAScript String-prototype]: https://tc39.es/ecma262/#sec-properties-of-the-string-prototype-object