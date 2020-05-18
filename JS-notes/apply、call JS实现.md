<!--
 * @Author: monai
 * @Date: 2020-03-27 17:34:45
 * @LastEditors: monai
 * @LastEditTime: 2020-05-18 18:45:07
 -->
# apply、call JS实现

call 实现如下
```javascript

function customCall(context, ...arg){

    //  call 不传作用域参数时默认为 window 
    //  通过 Object.assign 来浅拷 context，避免引用关系污染 context
    // let scope = Object.assign({}, context || window);

    //  虽然可以避免污染问题，但是 call/apply 本身没有处理，而是选择了继承
    //  这里也是传入context 可以继承调用函数的本身属性起点原因
    let scope = context || window;

    //  防止 scope 中有相同 key 被覆盖。  
    let key = Symbol();
    
    //  this 为调用的函数本身。
    scope[key] = this;

    //  收集返回值、...arg 多参数传参
    let result = scope[key](...arg);

    //  删除绑定的临时 symbol key
    delete scope[key];

    return result;
}

Function.prototype.customCall = customCall;

function Test(name, age){
    this.name = name;
    this.age = age;
    
    return `id: ${this.id}, name: ${this.name}, age: ${this.age}`;
}

let obj = {id : 10}

console.log(Test.customCall(obj, 'customCall', 26)); 
// id: 10, name: customCall, age: 26 
```
**注意: apply、call 会造成 context 参数（示例中为：obj 对象）继承调用函数本身得属性(`this.xx=xx`)**  
**代码示例中`let result = scope[key](...arg);` 这一步实际上就是：`obj.Test();`，所以 obj 在`Test()` 函数执行过程中被添加了 `name、age` 属性，也就是如下代码：**
```javascript
let result = scope[key](...arg);
// ↓
obj.Test();
// ↓
Test(name, age){
    obj.name = name;
    obj.age = age;
    return `id: ${obj.id}, name: ${obj.name}, age: ${obj.age}`;
}
// ↓
obj: {id: 10, name: xx, age: xx}
```
apply 与 call 区别在于第二个参数换成数组即可。  
new 运算符JS实现过程中使用了 call/apply 来让新创建的对象继承构造函数的this，所以可以访问到构造函数本身的属性。
