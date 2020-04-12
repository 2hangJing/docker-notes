最面试中被问到一道关于JS变量提升的面试题，题目如下：
```javascript
a();
b();

function a(){
    console.log('a');
}
var b  = function(){
    console.log('b');
}

//    'a'
//    Uncaught TypeError: a is not a function```
```
根据变量声明的规则：`var` 声明的变量与函数声明会提升到当前作用域顶部，`var` 赋值操作留在当前位置，函数体则一并提升。

知道规则不难得出答案，但是有没有想过为什么会有这样一个规则？

这里几天一直在找这个原因，这篇日志就是这几天的总结，原因就是和 **词法环境 Lexical Environments** 相关。

## 一、词法环境

什么是 词法环境 Lexical Environments ？

ECMAScript 规范定义：**词法环境是一种规范类型，用于根据ECMAScript代码的词法嵌套结构定义标识符与特定变量和函数的关联。而且，词汇环境与ECMAScript代码的一些特定语法结构相关联，比如函数声明、块语句或TryStatement的Catch子句，并且每次对这些代码求值时都会创建一个新的词汇环境。**

ECMAScript 规范 Lexical Environments 定义连接：[ECMAScript官方定义](http://www.ecma-international.org/ecma-262/8.0/index.html#sec-lexical-environments)

看着定义比较抽象，不过也确实如此，根据定义来说**词法环境是规范机制，ECMAScript程序不能直接访问或操作这些值。**

这也就是说没法直接用一个代码实例来解释解释其本身到底是什么，但是规范中提到可以用一个对象来大体描述其结构是什么样的，因此篇日志代码中有关词法环境的对象都是根据此条的”大体描述“，不代表真实结构如此。

由规范中可以看到**词法环境由环境记录、外部词法环境的引用（全局环境下为空）两部分组成。**

环境记录又有很多子类，比如说： 声明性环境记录（Declarative Environment Records）、对象环境记录（Object Environment Records）、全局环境记录（Global Environment Records）。

外部词法环境引用则是顾名思义，当前词法环境中对外部词法环境的引用。前面词法环境的定义可以看到对JS中块状语句都会创建一个新的词法环境，这也说明词法环境可以嵌套。

最后 **词法环境是在执行上下文中创建的。详细过程会在：《执行上下文 Execution Contexts》 日志中再写。**

代码实例：
```javascript
Lexical Environment ==> lex
Environment Records ==> envRec

function boo(){

    function aoo(){}
}

booExecutionContexts = {

    this : global,

    lex : {
        envRec:{		
            aoo : function(){}
        },
    outer: lex(global)
}}

globalExecutionContexts = {
    this : global,
    lex : {
        envRec :{
            boo : function(){}
        },
        outer : null
    }
}
```

代码中函数 aoo 的外部词法环境引用便是 boo。

**全局环境没有外部引用的词法环境，全局词法环境的外部环境引用为空。**

词法环境 Lexical Environments 包含两种子类的词法环境

1. LexicalEnvironment
2. VariableEnvironment

两者的区别是： 
**VariableEnvironment 变量环境关联的是 var 声明的变量，而其他的标识符关联、绑定都由 LexicalEnvironment 负责。**

## 二、 环境记录

什么是 环境记录 Environment Record？

查看了ECMAScript 规范，其中没有详细说明，不过大体的意思就是将变量、函数声明、对象属性等等标识符关联到对应ECMAScript 中定义的值。

说的比较抽象，我举个例子：

`let a = 10; console.log( a ); `这样简单的代码中，`console.log( a );` 中，`a` 到底是谁？

可能你习惯的脱口而出：我刚才声明的变量 `a` 啊！

对，没错，是 `a`。但是你有没有想过 `console.log( a );` 中的 `a` 如何与 `let a = 10;` 中的 a 相关联的呢？

答案就是 **环境记录 Environment Record （详细点是 Declarative Environment Records）。**

接着上面定义继续说。

环境记录 Environment Record 是一个统称，他有几个详细的子类，每个子类分别关联不同的标识符与ECMAScript 中的值。

ECMAScript 中提到的子类有：

1.  对象环境记录（Object Environment Records）
2.  声明性环境记录（Declarative Environment Records）
3.  全局环境记录（Global Environment Records）

其中 声明性环境记录（Declarative Environment Records）又包含

1.  函数环境记录（Function Environment Records）
2.  模块环境记录（module Environment Records）

用一张图来表示一下关系：

![](https://www.ismoon.cn/static/32a5ae058485cb76b06122eafe3bd705.png)

### 1. 对象环境记录

对象环境记录（Object Environment Records） 与对象相关联，每个对象都有一个与其绑定的 对象环境记录。

对象环境记录 中绑定的属性与其相关联的对象有关，包含相关对象中**所有符合标识符名称规范**的属性名称，包括继承的属性。也就是说像 `{'5' : 10}`，这种不符合规范的属性名称是不在对象环境记录中的。相关联对象的属性增、删都会导致 对象环境记录 的变动。

`with` 语句中 对象环境记录 可以将其相关联对象作为隐式值提供给函数使用。这句话说的比较拗口，但是表象很简单。

代码示例如下：
```javascript
function Obj0(){
    this.a = 'a';
    this['5'] = 10;
}

function Obj1(){
    this.b = 'b'
}

Obj0.prototype = new Obj1();

let newObj = new Obj0();

with(newObj){
    console.log(b) // 'b'
}
```

在code中可以看到 `with` 语句中，允许直接访问 `newObj` 的属性，而不用通过 `newObj.b`` 的方式访问。

`with`语句会将计算对象（newObj）的对象环境记录添加到正在运行的执行上下文的词法环境中。
> [ECMAScript with 规范](http://www.ecma-international.org/ecma-262/8.0/index.html#sec-with-statement)

### 2. 声明性环境记录

声明性环境记录（Declarative Environment Records）关联所有变量的声明、函数声明等，代码中则是 var、let、const、function声明、class、import、module ，函数环境下还会记录arguments 对象与形参。

> 英文原文：When an execution context is established for evaluating an ECMAScript function a new function Environment Record is created and bindings for each formal parameter are instantiated in that Environment Record.
> 
> 中文翻译：ECMAScript函数建立执行上下文时，将创建一个新的函数环境记录，并在该环境记录中实例化每个形式化参数的绑定。
> 
> [ECMAScript 环境记录中包含函数形参规范](http://www.ecma-international.org/ecma-262/#sec-functiondeclarationinstantiation)

执行上下文大体分为创建和执行两个阶段，所以声明性环境记录也可以大体分为两个阶段，一个是创建，一个是在执行上下文中对属性的赋值。

代码示例( 创建时 )：

```javascript
Lexical Environment     ==> lex
Variable Environment 	==> var
Environment Records     ==> envRec

function boo(x, y){
    var a = 10;
    let b = 20;
    const c = 30;
    function d(){}
}

boo('x', 'y');

booExecutionContexts = {
    this : global,
    lex : {
        envRec:{
            x : 'x',
                    y : undefined,
            b : '未初始化',        
            c : '未初始化',
            d : function (){}
        },
        outer: lex(global)
    },
    var : {
        envRec : {
            a : undefined   //   初始化时被赋值为 undefined
        },
        outer: lex(global)
    }
}
```
实例代码中可以看到在执行上下文初始化阶段，`let` 、`const` 声明的变量未进行初始化操作，而 `var` 声明的变量在词法环境初始化阶段便被赋值为 `'undefined'`，这也就是**变量提升**的现象的本质原因。实际上`let`、`const` 在初始化阶段也会进行所谓的‘提升’，但是因为规范中有所限制，所以未被赋值之前不能以任何方式访问。

> 英文原文：The variables are created when their containing Lexical Environment is instantiated but may not be accessed in any way until the variable's LexicalBinding is evaluated.
> 
> 中文翻译：变量(文章中指的 let、const)是在实例化其包含的词法环境时创建，但是在评估变量的LexicalBinding之前，不能以任何方式访问变量。
> 
> [ECMAScript 中关于 let、const 变量初始化规范](http://www.ecma-international.org/ecma-262/#sec-let-and-const-declarations)

> 英文原文：Var variables are created when their containing Lexical Environment is instantiated and are initialized to undefined when created.
> 
> 中文翻译：Var变量在其包含的词法环境被实例化时创建，在创建时被初始化为undefined。
>   
> [ECMASCript 中关于 var 变量初始化赋值 规范](http://www.ecma-international.org/ecma-262/#sec-variable-statement)

继续用上代码来当实例，当代码逐行执行直到 `boo('x', 'y');` 执行完毕，此时的抽象实例为：

```javascript
booExecutionContexts = {
    this : global,
    lex : {
        envRec:{
            x : 'x',
            y : undefined,
            b : '20',        
            c : '30',
            d : function (){}
        },
        outer: lex(global)
    },
    var : {
        envRec : {
            a : 10  
        },
        outer: lex(global)
    }
}

```

个个变量都被赋值了，相应的词法记录也进行了对应的改变。

既然涉及到标识符的初始化，那么必然会遇到标识符重复问题，这时候具体的规则会如下：

**1. var 声明的变量**

例如：

`var a = 10;` 初始化时赋值为 `undefined`。当与形参、函数声明、函数上下文中的特殊的 `'arguments'` 标识符冲突时优先级最低。
也就是说，如果 `var` 声明的变量出现标识冲突，那么会被无条件覆盖。
```javascript
/******************** 形参 *************************/
function aoo(x){
    alert(x)
    var x= 10;
}
aoo(20)    // 形参优先级更高 ==> 20

/******************** arguments *************************/
function aoo(){
    alert(arguments);
    var arguments = 10;
}
aoo()    // arguments类数组

/******************** 函数声明 *************************/
function aoo(){
    alert(boo);
    var boo = 10;
    function boo(){}
}
aoo()    // 函数优先级更高 ==> function boo(){}```
```
**2. 形参**

**当初始化词法环境时形参会与函数声明表现相同：会被直接初始化为初始值，即传入的实参。**

标识符冲突时优先级排列：大于 `var` 变量声明与 `arguments`，小于函数声明。

> 英文原文：Formal parameters and functions are initialized as part of FunctionDeclarationInstantiation.
> 
> 中文翻译：形式参数和函数作为函数声明实例化的一部分初始化。
> 
> [ECMAScript 函数形参初始化规范](http://www.ecma-international.org/ecma-262/#sec-functiondeclarationinstantiation)

代码实例：
```javascript
/******************** 形参 *************************/
function aoo(x){
    alert(x)
    var x= 10;
}
aoo(20)    // 形参优先级更高 ==> 20

/******************** arguments *************************/
function aoo(arguments){
    alert(arguments);
}

aoo(20)    // 形参优先级更高 ==> 20

/******************** 函数声明 *************************/
function aoo(boo){
    alert(boo);
    function boo(){}
}

aoo(20)    // 函数优先级更高 ==> function boo(){}

```

**3. 函数声明**

函数声明包含：`async` 函数声明、`Generator` 函数声明 。标识符冲突时优先级最高，覆盖其他任何同名标识符。

代码实例：

```javascript
/******************** async 函数声明 *************************/
function aoo(arguments){
    alert(arguments)
    var arguments= 10;
    async funciton arguments(){}
}

aoo(20)    // async 函数声明先级更高 ==> async funciton arguments(){}

/******************** Generator 函数声明 *************************/

function aoo(arguments){
    alert(arguments)
    var arguments= 10;
    funciton* arguments(){}
}

aoo(20)    // Generator 函数声明优先级更高 ==>  funciton* arguments(){}

/******************** 函数声明 *************************/

function aoo(arguments){
    alert(arguments)    
    var arguments= 10;
    funciton arguments(){}
}

aoo(20)    // 函数优先级更高 ==> function arguments(){}
```

**4. arguments**

其值为函数中的 Arguments 类数组，标识符冲突时优先级仅比变量声明高，低于其他。

**最后，标识符冲突优先级总结：**

**函数声明 > 形参 > arguments > var 变量声明**

### 3. 全局环境记录

全局环境记录（Global Environment Records）它比较特殊，特殊在哪里呢？ 写之前，先记录下Global本身的一些特别的地方。

首先ECMAScript 中定义的 Global 是一个不能直接用标识符访问的对象，但是它可以有一个”主机属性“指向它本身，比如宿主环境为浏览器时 Global.window === Global。

其次 Global 对象本身是 全局记录环境（Global Environment Records） 的 GetThisBinding() 方法的返回值，也就是说，我们可以认为 Global Environment Records === Global 。

最后 Global 对象是在进入执行上下文之前创建。
> [ECMAScript 中定义 Global Object 规范](http://www.ecma-international.org/ecma-262/#sec-global-object)

全局环境记录在逻辑上是单个记录，但它被封装为对象环境记录和声明性环境记录的复合记录。对象环境记录将关联全局对象作为其基本对象。

全局环境记录的对象环境记录包含：`函数声明（FunctionDeclaration）`、`Generator函数声明（GeneratorDeclaration）`、`Async函数声明（ AsyncFunctionDeclaration）`、`var 声明的变量（VariableStatement）`。其余的`let`、`const`、`class`等全部包含在声明性环境记录。

这里也就是为什么在全局执行上下文中 `var`，`function`，`async function`，`function*` 这几种类型的声明会变成 `window` 属性的原因：

1.  这几种声明都记录包含在全局环境记录的对象环境记录，也就是说它们是全局环境记录的属性。
2.  全局对象Global 就是全局环境记录的实例化返回值，所以上面几种声明成为了全局对象的属性。
3.  全局对象的“主机属性” `window` 指向 Global，所以 `Global.window.xxxVar === window.xxxVar`。（xxxVar 为全局执行上下文中声明的 var 变量）

代码实例：
```javascript
function a(){}            

async function b(){}

function* c(){}

var d;

class e {}

console.log(window['a'|'b'|'c'|'d'])    // 对应声明定义的值
console.log(window.e)                   // undefined
```

## 三、结语

至此词法环境已经写完了，围绕在我心中的疑问也解除了。

词法环境与执行上下文相关，在查看ECMAScript 相关规范学习的时候花了不少时间看看了相关的知识，全英文文档看着也很费劲，不过好在有道、谷歌翻译这两个软件很给力，这种术语的文章看不懂的地方都能翻译的很好。

后面有空再把 执行上下文（Execution Contexts）写个下来，在看这部分知识的时候终于弄懂了闭包原理（其实与词法环境相关）与this 相关的规范知识。

有空再写吧。