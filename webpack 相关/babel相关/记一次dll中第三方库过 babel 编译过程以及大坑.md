<!--
 * @Author: monai
 * @Date: 2021-10-14 09:49:17
 * @LastEditors: monai
 * @LastEditTime: 2021-10-14 18:29:40
-->
## 记：dll 包中 axios 过 babel 编译遇到的问题

### 一，问题
sentry 中频繁报错：`TypeError c(...).then(...).catch(...).finally is not a function` ，一看就知道是 Promise API 部分手机不支持，又看了眼报错得设备，基本都是 android5,6,7，随即开始着手解决。

既然知道是 Promise API 导致的兼容问题，那么第一反应就是 webpack 配置的 babel 有问题导致 Promise polyfill 没有引入。Chrome 打开线上链接 F12 看了下 Sources 里的 js 代码，一开始看的是业务代码中的 Promise 没有问题，后来发现是 axios 的 Promise，问题也开始明了：项目构建优化用了 webpack.DllPlugin，构建的 dll 包含 axios，而 axios 封装了 Promise。编译 dll 包过程中因为编译的全是 node_modules 中的库所以不过 babel 编译，~~而项目中 babel v7.x polyfill 是配置 @babel/plugin-transform-runtime 不污染全局的，所以 dll 包中 axios 用的 Promise 自然没有 polyfill。~~
**简述：**
1. sentry 中频繁报错：`TypeError c(...).then(...).catch(...).finally is not a function`，排查后是 axios Promise 兼容性问题。
2. 项目使用了 webpack.DllPlugin 构建了 axios、vue... 等 dll 包，第三方库默认 babel 不处理，所以 axios 没有经过 babel 编译。

### 二、解决
1. **修改 .babelrc，为 babel.config.json。** 

2. **node_modules 中的库默认是不过 babel 编译的，** 修改 webpack.configDll.js 如下：
``` javascript
module.exports= {
    module:{
        rules: [
            { 
                test: /\.js$/, 
                // 重要：axios 封装了 promise 通过 babel 编译下
                include: path.join(__dirname, '..', 'node_modules/axios'), 
                use: [{
                    loader: "babel-loader",
                }]
            }
        ]
    }
}
```
3. **修改 babel.config.json 中 sourceType 配置项。(原因记录在后面)** 修改如下：
``` json
{
    "presets": [],
    // 重要：避免 chunk 中 ESModule、CommonJS 混用导致错误，默认 module
    "sourceType": "unambiguous",
    "plugins": []
}
```
4. 重新编译 dll 包，问题解决。

### 三、原理记录
**1. 为什么 babel 需要编译 node_modules 中的库时需要修改配置文件名称？**
因为：需要 babel 编译 node_modules 中的库时 babel 官网明确说明需要修改配置文件名称（内容完全一样）为 babel.config.json。参考：https://babeljs.io/docs/en/configuration#babelconfigjson。

**2. 为什么修改 sourceType 配置项？**
原因：此配置项在 babel plugin 处理时非常重要，因为 plugin 需要明确地知道当前被编译的文件到底是 ESModule 还是 CommonJS 文件类型，才能决定在转码过程中到底是使用require还是import/export 引入其他文件。
实例：
 - sourceType: unambiguous 如果代码中包含 import/export 则判定为 ESModule，其他使用 CommonJS 模块类型。
``` javascript
// 源码
new Promise(res=> res())
// 编译后
var _Promise = require("@babel/runtime-corejs3/core-js-stable/promise");
new _Promise(function (res) { return res(); });
```
- sourceType: module， 默认值，使用 ESModule 当作模块引入。
``` javascript
// 源码
new Promise(res=> res())
// 编译后
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
new _Promise(function (res) { return res(); });
```
- sourceType: script，使用 CommonJS 当作模块引入。
``` javascript
// 源码
new Promise(res=> res())
// 编译后
var _Promise = require("@babel/runtime-corejs3/core-js-stable/promise");
new _Promise(function (res) { return res(); });
```
**axios 库源码模块引用是用了 CommonJS 模块类型，所以 babel 编译时需要 将配置项修改为 sourceType: unambiguous ，否则编译后 axios 文件中 ESModule，CommonJS 混用会报错**



**参考:**
1. https://babeljs.io/docs/en/configuration#babelconfigjson
2. https://juejin.cn/post/6844903937900822536#heading-16
3. https://juejin.cn/post/6844903669524086797
4. https://www.jianshu.com/p/2cf827195066
5. https://blog.liuyunzhuge.com/2019/10/11/babel%E8%AF%A6%E8%A7%A3%EF%BC%88%E5%85%AD%EF%BC%89-options/