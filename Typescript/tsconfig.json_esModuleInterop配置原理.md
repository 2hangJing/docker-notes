<!--
 * @Author: monai
 * @Date: 2021-09-15 11:45:58
 * @LastEditors: monai
 * @LastEditTime: 2022-05-26 22:19:16
-->
## 配置示例
```json
{
  "compilerOptions": {
    "esModuleInterop": true
  },
  "exclude": [
    "app/xx",
    "app/xx",
    "node_modules*"
  ]
}
```
## 情形类别
1. esm 导入 esm，两边都会转换成 cjs，严格按照 esm 规则写一般不会出问题。
2. esm 导入 cjs，兼容问题的产生是因为 esm 有 default 这个概念，而 cjs 没有。任何导出的变量在 cjs 看来都是 module.exports 这个对象上的属性，esm 的 default 导出也只是 cjs 上的 module.exports.default 属性而已。
3. cjs 导入 esm （一般不会这样使用）
4. cjs 导入 cjs，不会编译处理

## esm => cjs TS 默认编译规则
1. import
```typescript
 // before
 import React from 'react';
 console.log(React)
 // after
 var React = require('react');
 console.log(React['default'])

 // before
 import {Component} from 'react';
 console.log(Component);
 // after
 var React = require('react');
 console.log(React.Component)
 
 // before 
 import * as React from 'react';
 console.log(React);
 // after
 var React = require('react');
 console.log(React);
```

2. export
```typescript
// before
export const name = "esm";
export default {
	name: "esm default",
};
// after
exports.__esModule = true;
exports.name = "esm";
exports["default"] = {
	name: "esm default"
}
```

## TS 开启 esModuleInterop 后的编译规则
开启后只会改变 import 编译规则，但是 export 不会变。
```typescript
// before
import React from 'react';
console.log(React);
// after 代码经过简化
var react = __importDefault(require('react'));
console.log(react['default']);


// before
import {Component} from 'react';
console.log(Component);
// after 代码经过简化
var react = require('react');
console.log(react.Component);


// before
import * as React from 'react';
console.log(React);
// after 代码经过简化
var react = _importStar(require('react'));
console.log(react);
```
引入的两个 helper 函数如下：
```typescript
// 代码经过简化
var __importDefault = function (mod) {
  	return mod && mod.__esModule ? mod : { default: mod };
};

var __importStar = function (mod) {
	if (mod && mod.__esModule) {
		return mod;
	}

	var result = {};
	for (var k in mod) {
		if (k !== "default" && mod.hasOwnProperty(k)) {
		result[k] = mod[k]
		}
	}
	result["default"] = mod;

	return result;
};
```
**所以通过 __importDefault 函数翻译后就变成如下：**
```typescript
// before
import React from 'react';
console.log(React);
// after 代码经过简化
var react = __importDefault(require('react'));
console.log(react['default']);
// 继续
var react = __importDefault({component: component});
console.log(react['default']);
// 继续
var react = {default: {component: component}};
console.log(react['default']);
// 最后
console.log({component: component});
```
**__importStar 函数翻译后就变成如下：**
```typescript
// before
import * as React from 'react';
console.log(React);
// after 代码经过简化
var react = _importStar(require('react'));
console.log(react);
// 继续
var react = _importStar({component: component});
console.log(react);
// 继续
var react = {component: component, default: {component: component}};
console.log(react);
// 最后
console.log({component: component, default: {component: component}});
```
## 参考
知乎：<https://zhuanlan.zhihu.com/p/148081795>