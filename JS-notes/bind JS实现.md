<!--
 * @Author: monai
 * @Date: 2020-03-31 16:41:07
 * @LastEditors: monai
 * @LastEditTime: 2020-03-31 18:04:44
 -->
# bind JS实现

bind() 方法创建一个新的函数（术语：绑定函数 bound function，BF），在 bind() 被调用时，这个新函数的 this 被指定为 bind() 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。  
### ***语法：***  
***`function.bind(thisArg[, arg1[, arg2[, ...]]])`***

### **注意：**  
**1. bind 方法只会绑定一次，重复绑定后续不会覆盖。**  
```javascript
    let [obj1, obj2] = [{id: 1}, {id: 2}];

    function func(){ console.log(this) };

    let bind1 = func.bind(obj1);

    //  绑定函数 再次绑定 this，结果自然无效。
    let bind2 = bind1.bind(obj2);

    bind2(); // {id: 1}
```
**2. bind 方法thisArg 参数传入原始值，比如：1，则会转换成包装对象格式。**  
```javascript
    function func(){ console.log(this) };

    let bind = func.bind(1);

    bind(); // Number {1}
```
**3. 通过bind 函数可以创造偏函数**
```javascript
    function func(a, b ,c){ return a + b; };

    let bind = func.bind(null, 'bind');

    bind(' arg1'); // bind arg1
    bind(' arg2'); // bind arg2

    //  此方法可以用来对某个重复传参的函数进行优化
```
**4. 对绑定函数进行 new 元算符操作会忽略 bind 过程中 thisArg 参数**
```javascript
    let obj = {id: 1};

    function func(){ this.name = 'func' };

    let bind = func.bind(obj);

    let newObj = new bind(); // func {name: "func"}，new 操作忽略了传入的 obj。

```
### bind JS实现
```javascript
    function _bind(context, ...bindArg){
        //  调用的函数本身
        let func = this;

        function bindFun(...arg){

            let result;
            //  直接调用、object调用，此时的 this 为 window、object 。所以通过 this 原型链上是否有 bindFun.prototype 可以判断出是否使用 new 元算符调用。
            //  使用 new 运算符时会创建一个新对象，新对象.__proto__'链接'构造函数.protytype，然后再把这个对象作为 this 的上下文，所以 this.__proto__ === 构造函数.prototype。 
            if(this instanceof bindFun){
                
                //  new 操作符调用
                result = new func(...bindArg, ...arg);
            }else{
                
                //  直接调用
                result = func.call(context, ...bindArg, ...arg);
            }
            //  返回值
            return result;
        }
        
        //  bind 返回的 '绑定函数'
        return bindFun;
    }

    Function.prototype._bind = _bind;
```

**验证：**   
```javascript
    let [obj1, obj2] = [{id: 1}, {id: 2}];
    
    function fun(a, b){ console.log(this.id) };

    //  正常调用
    let bindFun = fun.bind(obj1);
    bindFun(); // 1

    //  重复调用
    let bindFun2 = bindFun.bind(obj2);
    bindFun2() // 1
```
