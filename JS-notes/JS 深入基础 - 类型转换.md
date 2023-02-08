
# JS 深入基础 - 类型转换

## 1. 强制类型转换

> ECMAScript 强制类型转换规范：[TC39 ECMAScript 类型强制转换]

#### 1.1 `Number` `BigInt` 强制类型转换
1. `Number` 强制转换：规则参考：[MDN Number 强制转换]
2. `BigInt` 强制转换：规则参考：[MDN BigInt 强制转换]


#### 1.2 `String` 强制转换
规则参考：[MDN String 强制转换]

**注意：模板字符串与`String.prototype.concat()` 并不是**


#### 1.3 `Object` 强制转换
规则参考：[MDN Object 强制转换]


#### 1.4 `Boolean` 强制转换
规则参考：[MDN Boolean 强制转换]

简单记忆：**`undefined` `null` `NaN` `+0` `-0` `0n` 转换为 `false`，剩下任何值都转换为 `true`。**


#### 1.5 原始值强制转换

对象强制转换为原始类型时，会按照 `[Symbol.toPrimitive](hint)` => `valueOf()` => `toString()` 顺序调用函数，其中之一返回原始类型值后停止。转换为不同类型原始值就是第一步函数 `hint` 参数不同。

**A. `Symbol.toPrimitive`**
当对象需要转化为原始值时优先调用此方法（如果存在），该函数被调用时，会被传递一个字符串参数 `hint`，表示要转换到的原始值的预期类型。

原始值强制转换时 `hint` 为 `default`。

**参数可选值：**
1. `'number'`：预期转化为 `Number` 类型。
2. `'string'`：预期转化为 `String` 类型。
3. `'default'`：`Number` `String` 都可以。

**注意：**
1. 当对象有此方法时，必须返回一个原始类型值，否则报错，示例：
    ```javascript
    const obj = {
        [Symbol.toPrimitive](hint){
            return {};
        }
    };
    +obj;   // Uncaught TypeError: Cannot convert object to primitive value
    ```
2. `Date` 和 `Symbol` 对象是唯一重写 `Symbol.toPrimitive` 方法的内置 JS 对象。

**B. `valueOf()`**
将调用函数时 `this` 通过 `Object` 强制转换（即 1.3 ）转换为对象并返回。**基本类型包装对象返回对应原始值。** 示例：
```javascript
const obj = {};
obj.valueOf();  // {}

const s = new String('s');
s.valueOf();    // 's'
```

**C. `toSting()`**
返回一个表示该对象字符串。具体参考 [JS 深入基础 - 类型判断]。


## 2. 隐式类型转换
隐式转换主要体现在各种操作符计算中，大体规则如下：

#### 2.1 加法运算符 `+`

加法操作符是非常特殊的一类，不仅规则众多就连操作符本身也区分一元、二元两种情况处理。

##### Ⅰ. 作为一元操作符

`+` 作为一元操作符时与 `Number()` 函数进行类型转换规则相似，只有 `BigInt` 转换有区别，其他完全相同。

转换的规则为：**1.1 `Number` `BigInt` 强制类型转换**。

##### Ⅱ. 作为二元操作符

作为二元操作符时，有以下转换规则，**规则优先级：A > B > C > D。**

**A. 两个操作数先转换为基本类型**

操作数有对象类型时先将对象进行**原始值强制转换（即 1.4），** 后续 B\C\D 规则都在**两侧操作数为基本类型**这个前提下。

验证：
```javascript
const obj = {
    [Symbol.toPrimitive](hint){
        // 此处判断为 default，代表期望转换后的原始值并不是 string。
        if(hint === 'default') return '原始值转换。';
        // 此处判断为 string，代表期望转换后的原始值是 string 类型。
        if(hint === 'string') return 'String 强制转换。';
    }
}
'' + obj            // '原始值转换。'
String(obj);        // 'String 强制转换。'
// 解析
// 使用 String() 函数强制转换 obj 为 string 得到的输出与，+ 字符串链接输出明显不同，因为两者底层转换规则不同。
```
```javascript
const obj = {
    valueOf(){
        return '原始值转换。';
    },
    toString(){
        return 'String 强制转换。';
    }
};
'值为：' + obj  // '值为：原始值转换。'
```

```javascript
0 + {}      // '0[object Object]'
// 实际运算逻辑如下：
// {} 无 Symbol.toPrimitive 方法，跳过第一步转换，进行第二步调用 valueOf()
0 + {}.valueOf();
// ↓
0 + {};
// ↓
0 + {}.toString();
// ↓ （此时运算规则符合 B，进行字符串拼接）
0 + '[object Object]'; 
// ↓
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
'0' + new Date()    // '0Mon Feb 06 2023 10:44:23 GMT+0800 (中国标准时间)' ps: Date 对象 Symbol.toPrimitive 被重写了
'0' + null          // '0null'
'0' + undefined     // '0undefined'
'0' + Infinity      // '0Infinity'
```

**C. 一个操作数类型为 `BigInt` 另一个不是则报错 `TypeError`。两个均为 `BigInt` 则执行加法运算。**

**D. 剩下类型，两个操作数进行 `Number` `BigInt` 强制类型转换（即 1.1 ），再进行算数运算，各种不同情况如下示例：**
```javascript
0 + true                // 1 ps: true=>1 false=>0
0 + null                // 0
0 + undefined           // NaN ps: undefined=>NaN
0 + 'B'                 // '0B' 符合规则 B，此处执行字符串拼接
Symbol(1) + Symbol(1)   // Error！Cannot convert a Symbol value to a number
//... 其他情况参考 `Number` 强制转换 后的值
```


#### 2.2 算数运算符 `- * / %`

两个操作数均进行 `Number` `BigInt` 强制类型转换（即 1.1 ），再进行算术运算。
```javascript
8 * true        // 8
0 * (()=>{})    // NaN
{} * {}         // NaN
// ...
```


#### 2.3 逻辑非 `!`
规则参考：[MDN Boolean 强制转换]，其他逻辑操作符参考此规则。

**A. 通过 `Boolean(x)` 对 `x` 进行 `Boolean` 强制转换（即 1.4）。**
**B. 取反后返回。**


#### 2.4 相等操作符 `== !=`
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
3. 两个操作数类型不同：一个操作数类型为 `Boolean`，则此操作数转换为 `Number`，再进行比较。
4. 两个操作数类型不同：`String` 与 `Number`，`String` 强制转换为 `Number`（即 1.1），在进行比较。
5. 两个操作数类型不同：`String` 与 `BigInt`，`String` 强制转换为 `BigInt`（即 1.1），在进行比较。
6. 两个操作数类型不同：`Number` 与 `BigInt`，直接比较大小。

一些特殊相等判断：
```javascript
new String('-Infinity') == [' ']    // false
// 解析：
// 看似复杂，但是两个操作数都是对象，只用判断引用是否为一个。很明显不是一个，返回 false。
```

```javascript
new String('1') == true
// ↓
'1' == true
// ↓
'1' == 1
// ↓
1 == 1  // true
// 解析：
// 规则流程：C => D.3 => D.4 => A
```


#### 2.5 关系操作符 `< <= > >=`
规则参考：[MDN 小于操作符]，其他关系操作符参考此规则。

**A. 出现 `Symbol` 类型操作数直接报错：`Uncaught TypeError: Cannot convert a Symbol value to a number`**

**B. 出现 `NaN` 直接返回 `false`**

**C. `Number` `Bigint` 直接比较大小**
```javascript
BigInt(10) < 10.01  // true
```

**D. 两个操作数类型均为 `String` 则按位（从大到小）Unicode 编码值比较大小。**
`charCodeAt(i)` 函数返回字符串位置 `i` 处 Unicode 编码值。示例：
```javascript
'123'.charCodeAt(1) // 50
'13'.charCodeAt(1)  // 51
'123' < '13'        // true 
// 解析:
// 两个操作数第一位 '1' Unicode 值相同，比较第二位 '2'/'3'，Unicode 值 50 < 51 最终表达式值为 true
```
**E. 剩余其他类型进行 `Number` 强制类型转换（即 1.1），再比较大小。**
一些特殊比较：
```javascript
{} < 0          
// ↓
NaN < 0         // false
// 解析：
// 在 Number 强制转换中，{} 转换为 NaN 从而符合规则 B，直接返回 false
```

```javascript
[-Infinity] < 0
// ↓
'-Infinity' < 0
// ↓
-Infinity < 0   // true
// 解析：
// Array toString 被重写为 join，在 Number 强制转换中被转换为 '-Infinity' 字符串，再被转换为 -Infinity 全局变量，-Infinity 小于任何值。
```

```javascript
'100_100' < 0   
// ↓
NaN < 0         // false
// 解析
// 在 Number 强制转换中不支持数字分隔符字符串，转换为 NaN，直接返回 false
```


### 3. 参考

1. [MDN 相等符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Equality)
2. [MDN Number 强制转换]
3. [MDN String 强制转换]
4. [MDN BigInt 强制转换]
5. [MDN Object 强制转换]
6. [MDN Boolean 强制转换]
7. [MDN 相等操作符]
8. [MDN 小于操作符]
9. [TC39 ECMAScript 类型强制转换]

[MDN Number 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_coercion

[MDN String 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion

[MDN BigInt 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#bigint_coercion

[MDN Object 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#object_coercion

[MDN Boolean 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean#boolean_coercion

[MDN 相等操作符]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Equality

[MDN 小于操作符]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Less_than

[JS 深入基础 - 类型判断]: https://ismoon.cn/articleDetail?id=46

[TC39 ECMAScript 类型强制转换]: https://tc39.es/ecma262/#sec-type-conversion


