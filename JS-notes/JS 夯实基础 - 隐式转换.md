
# JS 类型转换

## 一. 强制类型转换

#### 强制原始值转换
对象强制转换为原始类型时，会按照 `[Symbol.toPrimitive]()` => `valueOf()` => `toString()` 顺序调用函数，其中之一返回原始类型值后停止。

**A. `[Symbol.toPrimitive]()`**
当对象需要转化为原始值时优先调用此方法，该函数被调用时，会被传递一个字符串参数 hint，表示要转换到的原始值的预期类型。：
1. `'number'`：转化为 `Number` 类型。
2. `'string'`：转化为 `String` 类型。
3. `'default'`：`Number` `String` 都可以。

**当对象有此方法时，必须返回一个原始类型值，否则报错，示例：**
```javascript
let obj = {
    [Symbol.toPrimitive](hint){
        return {};
    }
};
+obj    // Uncaught TypeError: Cannot convert object to primitive value
```
`Date` 和 `Symbol` 对象是唯一重写 `[Symbol.toPrimitive]()` 方法的内置 JS 对象。


**B. `valueOf()`**
除了包装对象以及覆写过 `valueOf` 的对象，均返回对象本身。**包装对象返回对应原始值。** 示例：
```javascript
let obj = {};
obj.valueOf();  // {}

let s = new String('s');
s.valueOf();    // 's'
```

**B. `toSting()`**
返回一个表示该对象字符串。具体参考 [JS 夯实基础 - 类型判断]。




**A. 有限调用 **

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures#%E5%BC%BA%E5%88%B6%E7%B1%BB%E5%9E%8B%E8%BD%AC%E6%8D%A2

## 隐式类型转换
隐式转换主要体现在各种操作符计算中，大体规则如下：

#### 前置知识
**1. `Number` 强制转换**：

顾名思义，其他类型强制转换为 `Number` 类型。规则参考：[Number 强制转换]

#### 加法运算符 +

加法操作符是非常特殊的一类，不仅规则众多就连操作符本身也区分一元、二元两种情况处理。

##### Ⅰ. 作为一元操作符

`+` 作为一元操作符时与 `Number()` 函数进行类型转换规则相似，只有 `BigInt` 转换有区别，其他完全相同。

转换的规则为：**前置知识：[Number 强制转换]**。

##### Ⅱ. 作为二元操作符

作为二元操作符时，有两条转换规则，**规则 A 优先级大于 B。**

**A. 一侧数据类型为 `String` 则另外一侧也转换为 `String`，然后进行字符串拼接。各种不同情况如下示例：**
```javascript
'0' + 0         // '00'
'0' + 0         // '00'
'0' + {}        // '0[object Object]'
'0' + null      // '0null'
'0' + undefined // '0undefined'
'0' + Infinity  // '0Infinity'
```

**B. 一侧数据类型为 `Number` 则另外一侧也将类型转换为 `Number` 进行算数运算，各种不同情况如下示例：**

- 对象：先后调用 `valueOf()`、`toString()` 获取原始值，进行运算。
    ```javascript
    0 + {}      // '0[object Object]'
    // 实际运算逻辑如下：
    0 + {}.valueOf();
    // 👇
    0 + {};
    // 👇
    0 + {}.toString();
    // 👇 （此时运算规则符合 A，进行字符串拼接）
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

- 其他所有类型执行 [Number 强制转换] 再进行算数运算，各种不同情况如下示例：
    ```javascript
    0 + true        // 1 ps: true=>1 false=>0
    0 + null        // 0
    0 + undefined   // NaN ps: undefined=>NaN
    0 + 'B'         // '0B' 符合规则 A，此处执行字符串拼接
    //... 其他情况参考 `Number` 强制转换 后的值
    ```

#### 算数运算符 - * / %

两个操作数均 `Number` 强制转换，再进行算术运算。
```javascript
8 * true        // 8
0 * (()=>{})    // NaN
{} * {}         // NaN
// ...
```

#### 相等运算符 ==

规则参考：[MDN 相等运算符]

**1. 两个操作数类型相同：**
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

**2. null、undefined**
1. `null`：仅与本身以及 `undefined` 返回 `true`。
2. `undefined`：仅与本身以及 `null` 返回 `true`。

**3. 一个操作数为对象类型**
1. 另外一个也是对象，规则参考 **A。**
2. 另外一个操作数为基本类型，则将对象强制转换为基本类型再做对比。转换方法参考：**一. 强制类型转换**。

**4. 当前步骤**



### 参考

1. [JavaScript数据类型隐式转换](https://blog.csdn.net/m0_57135756/article/details/124024502)
2. [MDN 相等符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Equality)

[Number 强制转换]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_coercion
[MDN 相等运算符]: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Equality
[JS 夯实基础 - 类型判断]: ./JS%20%E5%A4%AF%E5%AE%9E%E5%9F%BA%E7%A1%80%20-%20%E7%B1%BB%E5%9E%8B%E5%88%A4%E6%96%AD/note.md#Object.prototype.toString.call()


