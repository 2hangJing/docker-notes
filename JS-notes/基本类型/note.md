<!--
 * @Author: monai
 * @Date: 2020-03-19 16:10:29
 * @LastEditors: monai
 * @LastEditTime: 2020-05-11 15:44:01
 -->

# JS 数据类型总结

JS总共又8种数据类型：  
7种原始类型：String Number Null Undefined Boolean Symbol BigInt  
1种引用类型：Object ( Array、JSON、Date 等都是内置对象 )  

**原始类型的值称为“原始值”，原始值是不可改变的，赋值改变的是变量值而非原始值本身。**
```javascript
let a = [];
a.push(0); //a ==> [0]
// 引用类型的值可以改变。

let b = 'b';
b.toUpperCase(); //b ==> 'b'
// 基本类型的值没有改变。
```

基本类型有包装对象的概念，比如`let a = 123; a.toString() //'123'` number 类型的123却可以像object一样调用方法，这就是因为包装对象的概念。  
**7种基本类型中 null undefined 没有包装对象，** 其他5种 string number boolean symbol bigint 都有包装对象。

## 包装对象
包装对象就是原始类型对应的内置对象，分别是 String Number Boolean Symbol Bigint。包装对象的作用就是让原始类型的值可以调用一些方法，因为 JS 中只有 Object 有方法，原始类型没有，而包装对象就是为了解决这个问题的。

包装对象通过 valueOf() 方法获取对应的原始值：
```javascript
let strObj = new String('Moon');
typeof strobj; // object

strObj.valueOf(); // 'Moon'
```

## 基本类型梳理  
### string
`let a = '10'; typeof a; //string`  
`let a = String('10'); typeof a; //string`  
`let a = new String(10); typeof a; //object`  
String(10) 操作是将参数转换为 string 类型。   

string 有包装对象，为 String, 例如：  
```javascript
String.prototype.valueOf = function(){ return 0; };
let a = 'a';  
a.valueOf(); //0

// 以上代码可以分解为：
String.prototype.valueOf = function(){ return 0; };
let a = new String('a');
a.valueOf();
a = 'a';
```
### number
值包含 -(253 -1) 到 253 -1 范围类的数字、NaN、+Infinity、-Infinity 后面三个都是特殊的值。  
有几个特殊值：  
1. Number.MAX_VALUE，JS能表达的最大数。  
2. Number.MIN_VALUE，JS里最接近 0 的正值，而不是最小的负值。  
3. Number.MAX_SAFE_INTEGER，JS里能够正确显示（正确存储）的最大数，超过之后运算显示的值将不精准。  
4. Number.MIN_SAFE_INTEGER，JS里能够正确显示（正确存储）的最小数，超过之后运算显示的值将不精准。  
5. +Infinity，正无穷，超过 Number.MAX_VALUE 的数、1/0 等会出现此值。  
6. -Infinity，负无穷，-1/0 会出现此值。  
7. NaN，Number('a')、0/0 等会出现此值，代表非数字。搞笑的是NaN是number 类型的一个值，非数字本身却是数字本身的一个值。
8. `typeof NaN; //number`  
   
number 有包装对象，为 Number。  

### boolean
值只有 true、false 这两个，并且也有包装对象：Boolean。

### symbol
符号(Symbols)是ECMAScript 第6版新定义的。符号类型是唯一的并且是不可修改的, 并且也可以用来作为Object的key的值。  
symbol 有包装对象：Symbol。
```javascript
Symbol.prototype.valueOf = function(){ return 0; };
let a = Symbol();  
a.valueOf(); //0
```
获得symbol值需要用 Symbol() 函数，而不能 new Symbol()，想获取 Symbol 对象需要用 Object(SymbolValue)，示例：
```javascript
let a = Symbol();
a; // Symbol()
typeof a; // symbol

let b = Object(a);
b; // Symbol {Symbol()}
typeof b; // object
```

### bigint
BigInt 类型是 JavaScript 中的一个基础的数值类型，可以用任意精度表示整数。使用 BigInt，可以安全地存储和操作大整数，甚至可以超过数字的安全整数限制。数字后面加n 表示 bigint 类型。  
bigint 也有包装对象，和Symbol 类似。

### null
null 为 NUll 类型的唯一值，代表对象的值未设置。没有包装对象。

### undefined
undefined 为 Undefined 的唯一值，代表变量的值未设置。没有包装对象。

### object
Object 构造函数为给定值创建一个对象包装器。如果给定值是 null 或 undefined，将会创建并返回一个空对象，否则，将返回一个与给定值对应类型的对象。  
示例：
```javascript
let a = new Object(10);

a instanceof Number; //true
```

当以非构造函数形式被调用时，Object 等同于 new Object()。前面 symbol 代码示例中就没有使用 new 操作符。