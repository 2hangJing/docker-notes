<!--
 * @Author: monai
 * @Date: 2021-09-06 10:18:58
 * @LastEditors: monai
 * @LastEditTime: 2022-05-26 22:19:06
-->
# 柯里化(Currying)
***
## 定义 
柯里化就是将**接受多参数函数**转化成可以**逐个调用的接受单个、多个参数**并返回**接收剩下参数函数**的方法。代码简易说明：`f(a,b,c) => f(a)(b)(c)`。

## 示例
**Ⅰ、明确调用参数数目**
```javascript
let currying = fn =>{
	let innerFn = (...num)=>{
        //  fn.length：函数需要传入形参的个数
        if(num.length>=fn.length){
            return fn.apply(this, num);
        }else{
            return innerFn.bind(this, ...num)
        }
	}
    return innerFn;
}
let add = (a,b,c)=>a+b+c;
let addCurry = currying(add)
console.log(addCurry(1)(2,3))   // 6
```

**Ⅱ、不确定形参数目**
```javascript
let currying = fn =>{
	let totalArg = [];
	let innerFn = function(...num){
		totalArg.push(...num);
		return num.length ? innerFn: add(totalArg);
	}
	return innerFn;
}
let add = (arg: number[])=>{
	return arg.reduce((total, item)=>total+item, 0);
}
let addCurry = currying(add)
console.log(addCurry(1)(2)(3,4, 5)())  //15
```
**参考：<https://zh.javascript.info/currying-partials>**