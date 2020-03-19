<!--
 * @Author: monai
 * @Date: 2020-03-19 16:10:29
 * @LastEditors: monai
 * @LastEditTime: 2020-03-19 18:14:04
 -->

# JS 数据类型总结

JS总共又8种数据类型：  
7种基本类型：String Number Null Undefined Boolean Symbol BigInt  
1种引用类型：Object ( Array、JSON、Date 等都是内置对象 )  

**基本类型的值都是不可改变的，赋值改变的是变量值而非基本类型的值。**
```javascript
    let a = [];
    a.push(0); //a ==> [0]
    引用类型的值可以改变。

    let b = 'b';
    b.toUpperCase(); //b ==> 'b'
    基本类型的值没有改变。
```

基本类型有包装对象的概念，比如`let a = 123; a.toString() //'123'` number 类型的123却可以像object一样调用方法，这就是因为包装对象的概念。  
**7种基本类型中 null undefined 没有包装对象，** 其他5种 string number boolean symbol bigint 都有包装对象。

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

    以上代码可以分解为：
    String.prototype.valueOf = function(){ return 0; };
    let a = new String('a');
    a.valueOf();
    a = 'a';
```
### number
值包含 -(253 -1) 到 253 -1 范围类的数字、NaN、+Infinity、-Infinity 后面三个都是特殊的值。  
有几个特殊值：  
Number.MAX_VALUE，JS能表达的最大数。  
Number.MIN_VALUE，JS里最接近 0 的正值，而不是最小的负值。  
Number.MAX_SAFE_INTEGER，JS里能够正确显示（正确存储）的最大数，超过之后运算显示的值将不精准。  
Number.MIN_SAFE_INTEGER，JS里能够正确显示（正确存储）的最小数，超过之后运算显示的值将不精准。  
+Infinity，正无穷，超过 Number.MAX_VALUE 的数、1/0 等会出现此值。  
-Infinity，负无穷，-1/0 会出现此值。  
NaN，Number('a')、0/0 等会出现此值，代表非数字。搞笑的是NaN是number 类型的一个值，非数字本身却是数字本身的一个值。
`typeof NaN; //number`  
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
BigInt类型是 JavaScript 中的一个基础的数值类型，可以用任意精度表示整数。使用 BigInt，可以安全地存储和操作大整数，甚至可以超过数字的安全整数限制。数字后面加n 表示 bigint 类型。  
bigint 也有包装对象，和Symbol 类似。

### null
null 为 NUll类型的唯一值，代表对象的值未设置。

### undefined
undefined 为 Undefined 的唯一值，代表变量的值未设置。