
# JS 类型转换

## 1. 强制类型转换

#### 1.1 `Number` `BigInt` 强制类型转换
1. `Number` 强制转换：规则参考：[Number 强制转换]
2. `BigInt` 强制转换：规则参考：[BigInt 强制转换] **此处后续补充**


#### 1.2 `String` 强制转换
规则参考：[String 强制转换]

**注意：模板字符串与`String.prototype.concat()` 并不是**


#### 1.3 `Object` 强制转换
规则参考：[Object 强制转换] **此处后续补充**

对象强制转换为原始类型时，会按照 `[Symbol.toPrimitive](hint)` => `valueOf()` => `toString()` 顺序调用函数，其中之一返回原始类型值后停止。转换为不同类型原始值就是第一步函数 `hint` 参数不同。

#### 1.4 原始值强制转换
**A. `[Symbol.toPrimitive]()`**
当对象需要转化为原始值时优先调用此方法，该函数被调用时，会被传递一个字符串参数 `hint`，表示要转换到的原始值的预期类型。

原始值强制转换时 `hint` 为 `default`。

**参数可选值：**
1. `'number'`：预期转化为 `Number` 类型。
2. `'string'`：预期转化为 `String` 类型。
3. `'default'`：`Number` `String` 都可以。

**注意：**
1. 当对象有此方法时，必须返回一个原始类型值，否则报错，示例：
    ```javascript
    let obj = {
        [Symbol.toPrimitive](hint){
            return {};
        }
    };
    +obj;   // Uncaught TypeError: Cannot convert object to primitive value
    ```
2. `Date` 和 `Symbol` 对象是唯一重写 `[Symbol.toPrimitive]()` 方法的内置 JS 对象。

**B. `valueOf()`**
除了包装对象以及覆写过 `valueOf` 的对象，均返回对象本身。**包装对象返回对应原始值。** 示例：
```javascript
let obj = {};
obj.valueOf();  // {}

let s = new String('s');
s.valueOf();    // 's'
```

**C. `toSting()`**
返回一个表示该对象字符串。具体参考 [JS 夯实基础 - 类型判断]。


## 2. 隐式类型转换
隐式转换主要体现在各种操作符计算中，大体规则如下：

#### 加法运算符 `+`

加法操作符是非常特殊的一类，不仅规则众多就连操作符本身也区分一元、二元两种情况处理。

##### Ⅰ. 作为一元操作符

`+` 作为一元操作符时与 `Number()` 函数进行类型转换规则相似，只有 `BigInt` 转换有区别，其他完全相同。

转换的规则为：**1.1 `Number` `BigInt` 强制类型转换**。

##### Ⅱ. 作为二元操作符

作为二元操作符时，有以下转换规则，**规则优先级：A > B > C > D。**

**A. 两个操作数先转换为基本类型**
这里的规则特指操作数有对象类型时先将对象进行**原始值强制转换（即 1.4），** 后续 B\C\D 规则都在**两侧操作数都是基本类型**这个前提下。
```javascript
0 + {}      // '0[object Object]'
// 实际运算逻辑如下：
// {} 无 [Symbol.toPrimitive]() 方法，跳过第一步转换，进行第二步调用 valueOf()
0 + {}.valueOf();
// 👇
0 + {};
// 👇
0 + {}.toString();
// 👇 （此时运算规则符合 B，进行字符串拼接）
0 + '[object Object]'; 
// 👇
'0[object Object]'
```

**注意：不同对象调用这两个函数时返回值可能不同。**
例如：`Array` 调用 `toString()` 实际上是 `join()`。
```javascript
0 + []          // '0'
0 + [1,2,3]     // '01,2,3'
```
例如：`Function` 调用 `toString()` 返回是函数本体字符串。
```javascript
0 + (() => {})    // '0() => {}'
```

**B. 一个操作数类型为 `String` 则另一个操作数进行 `String` 强制转换（即 1.2），然后进行字符串拼接。各种不同情况如下示例：**
```javascript
'0' + 0             // '00'
'0' + {}            // '0[object Object]'
'0' + new Date()    // '0Mon Feb 06 2023 10:44:23 GMT+0800 (中国标准时间)' ps: Date 对象 [Symbol.toPrimitive]() 被重写了
'0' + null          // '0null'
'0' + undefined     // '0undefined'
'0' + Infinity      // '0Infinity'
```
注意：此处对象转换规则是原始值转换（规则 A）而非 `String` 强制转换（即 1.2）。验证：
```javascript
let obj = {
    [Symbol.toPrimitive](hint){
        // 此处判断为 default，代表期望转换后的原始值并不是 string。
        if(hint === 'default') return '原始值转换。';
        // 此处判断为 string，代表期望转换后的原始值是 string 类型。
        if(hint === 'string') return 'String 强制转换。';
    }
}
'值为：' + obj  // '值为：原始值转换。'
```
```javascript
let obj = {
    valueOf(){
        return '原始值转换。';
    },
    toString(){
        return 'String 强制转换。';
    }
};
'值为：' + obj  // '值为：原始值转换。'
```

**C. 一个操作数类型为 `BigInt` 另一个不是则报错 `TypeError`。两个均为 `BigInt` 则执行加法运算。**

**D. 两个操作数进行 `Number` `BigInt` 强制类型转换（即 1.1 ），再进行算数运算，各种不同情况如下示例：**
```javascript
0 + true                // 1 ps: true=>1 false=>0
0 + null                // 0
0 + undefined           // NaN ps: undefined=>NaN
0 + 'B'                 // '0B' 符合规则 B，此处执行字符串拼接
Symbol(1) + Symbol(1)   // Error！Cannot convert a Symbol value to a number
//... 其他情况参考 `Number` 强制转换 后的值
```


#### 算数运算符 `- * / %`

两个操作数均进行 `Number` `BigInt` 强制类型转换（即 1.1 ），再进行算术运算。
```javascript
8 * true        // 8
0 * (()=>{})    // NaN
{} * {}         // NaN
// ...
```


#### 相等操作符 `== !=`
规则参考：[MDN 相等操作符]，不等 `!=` 转换算法相同。

**A. 两个操作数类型相同：**
1. `Object`：仅当引用的对象为同一个才返回 `true`。
2. `Symbol`：仅当引用值相同时返回 `true`。注意：利用 `Symbol.for()` 函数生成相同引用值。
3. `String`：值相同返回 `true`。
4. `Number`：值相同返回 `true`。注意以下特殊值：
   ```javascript
    +0 == -0                // true
    Infinity == Infinity    // true
    NaN == 任何值            // false    
    ```
5. `Boolean`：值相同返回 `true`。
6. `BigInt`：值相同返回 `true`。
7. `null`：值相同返回 `true`。
8. `undefined`：值相同返回 `true`。

**B. `null`、`undefined`**
1. `null`：仅与本身以及 `undefined` 返回 `true`。
2. `undefined`：仅与本身以及 `null` 返回 `true`。

**C. 一个操作数为对象类型**
1. 另外一个也是对象，规则参考 **1。**
2. 另外一个操作数为基本类型，则将对象强制转换为基本类型再做对比。转换规则参考：**原始值强制转换（即 1.4）。**

**D. 此时两个操作数都是基本类型**
1. 类型相同参考 A。
2. 两个操作数类型不同：一个操作数类型为 `Symbol`，参考 A。
3. 两个操作数类型不同：一个操作数类型为 `Boolean`，则此转换为 `Number`，再进行比较。
4. 两个操作数类型不同：`String` 与 `Number`，`String` 强制转换为 `Number`（即 1.1），在进行比较。
5. 两个操作数类型不同：`String` 与 `BigInt`，`String` 强制转换为 `BigInt`（即 1.1），在进行比较。
6. 两个操作数类型不同：`Number` 与 `BigInt`，直接比较大小。


#### 关系操作符 `< <= > >=`
规则参考：[MDN 小于操作符]，其他关系操作符参考此规则。

**A. `Object` 类型进行 `Number` `BigInt` 强制类型转换（即 1.1）**
`[Symbol.toPrimitive](hint)` 参数传入 `number`，期望转换后的原始值为 `Number` 类型。

后续规则中操作数都为基本类型。

**B. 两个操作数类型均为 `String` 则按位（从大到小）Unicode 编码值确定大小。**
`charCodeAt(i)` 函数返回字符串位置 `i` 处 Unicode 编码值。

**C. **

### 参考

1. [JavaScript数据类型隐式转换](https://blog.csdn.net/m0_57135756/article/details/124024502)
2. [MDN 相等符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Equality)

[Number 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_coercion

[String 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion

[BigInt 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#bigint_coercion

[Object 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#object_coercion

[MDN 相等操作符]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Equality

[MDN 小于操作符]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Less_than

[JS 夯实基础 - 类型判断]: ./JS%20%E5%A4%AF%E5%AE%9E%E5%9F%BA%E7%A1%80%20-%20%E7%B1%BB%E5%9E%8B%E5%88%A4%E6%96%AD/note.md#Object.prototype.toString.call()


