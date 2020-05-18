<!--
 * @Author: monai
 * @Date: 2020-03-25 13:38:53
 * @LastEditors: monai
 * @LastEditTime: 2020-05-18 16:54:02
 -->
# new 运算符原理以及实现

new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象的实例。

* 创建一个空的简单JavaScript对象（即{}）；
* 链接该对象（即设置该对象的构造函数）到另一个对象 ；
* 将步骤1新创建的对象作为this的上下文 ；
* 如果该函数没有返回对象，则返回this。

**总结一下 new 运算符创建的对象特点：**
* new 过程中，构造函数内 `this.__proto__ === 构造函数.prototype`。
* 返回对象可以访问构造函数的原型链（prototype）属性。
* 返回对象可以访问构造函数的 this 上绑定的属性。
* 构造函数有返回值且返回值是对象则返回对象，如果不是则返回创建的对象。
    
知道了new 运算符做了什么，下面就用JS来实现一下：  
```javascript
function newCustom(constructor, ...args){
    //  创建一个对象，并且将对象的 __proto__ 链接到 构造函数的 prototype
    let obj = Object.create(constructor.prototype);

    //  1. 确定构造函数返回值
    //  2. 通过 call 方法让 obj 继承构造函数 this 对象，从而让 obj 有构造函数的属性
    let result = constructor.call(obj, ...args);

    //  构造函数返回值是对象则返回改对象，否则返回 obj
    return result instanceof Object ? result : obj;
}

function Foo(a, b){
    this.a = a;
    this.b = b;
}

Foo.prototype.name = function (){
    return 'Foo';
}

let obj = newCustom(Foo, 'aa', 'bb');

console.log(obj.a); // aa
console.log(obj.b); // bb
console.log(obj.name()); // Foo
```


