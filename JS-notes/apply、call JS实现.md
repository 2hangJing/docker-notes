<!--
 * @Author: monai
 * @Date: 2020-03-27 17:34:45
 * @LastEditors: monai
 * @LastEditTime: 2020-03-27 18:29:47
 -->
# apply、call JS实现

call 实现如下
```javascript

    function customCall(context, ...arg){

        //  call 不传作用域参数时默认为 window 
        //  通过 Object.assign 来浅拷 context，避免引用关系污染 context
        let scope = Object.assign({}, context || window);

        //  防止 scope 中有相同 key 被覆盖。  
        let key = Symbol();
        
        //  this 为调用函数
        scope[key] = this;

        //  收集返回值、...arg 多参数传参
        let result = scope[key](...arg);

        return result;
    }

    Function.prototype.customCall = customCall;

    function test(name, age){
        this.name = name;
        this.age = age;
        console.log(this);
        return this.id;
    }

    let obj = {id : 10}

    test.customCall(obj);
```