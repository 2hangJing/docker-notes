# 记录 webpack externals 配置与原理研究

## externals 作用以及配置
### 作用
externals 是 webpack 配置优化中的一项。通过配置 externals 可以在 webpack 编译时跨过配置的库，从而减少编译时间。

### 配置

webpack 配置如下:
```javascript
// webpack.config.js
module.exports = {
    // output: ,
    // plugins: ,
    // ...其他无关配置
    externals: {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios'
    }
}
```
externals 中 key 为代码中 import 的库名称，value 为挂载到 window 下库的 key，示例：

**代码中导入的库名称: `'vue'`**
```javascript
import v from 'vue';
```
**挂载到 window 下库的 key: `Vue`**
```javascript
console.log(window);
// {
//     ...
//     Vue: xxx
// }
```
还有一些高级配置项，项目配置中基本用不到不再记录，详细可查：
1. <https://webpack.html.cn/configuration/externals.html>
2. <https://www.webpackjs.com/configuration/externals/>

## externals 原理 

配置很简单，原理其实也很简单。首先需要保证的的一点是：

对配置了 externals 的库需要在 index.html 中通过 `<script src='xxx'>` 标签导入，而这种连接的库也是有要求的，即对外接口必须挂载到 window 下。

**webpack 在编译时对配置的模块直接赋值为 window 对象上库挂载的 key，** 原理就是这么简单...

### 编译结果对比

对比编译结果前先铺垫两个前置函数:

1. `__webpack_require__` 通过 moduleId 执行对应 module 函数，有缓存功能。
2. `__webpack_require__.d` 有三个参数 `exports, name, getter` 整个函数就是给 `export` 对象添加 `name` 属性的 `get` 为 `getter`。

```javascript
function __webpack_require__(moduleId) {
    // 此处判断缓存
    if(installedModules[moduleId]) {
        return installedModules[moduleId].exports;
    }
    // 新建 module 并缓存
    var module = installedModules[moduleId] = {
        i: moduleId,
        l: false,
        exports: {}
    };
    // 调用模块初始化
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    // 模块缓存标识符
    module.l = true;
    // 导出 module.exports 对象
    return module.exports;
}
// 给 exports 对象添加 name 属性，读取 name get 时返回 getter
__webpack_require__.d = function(exports, name, getter) {
	if(!__webpack_require__.o(exports, name)) {
		Object.defineProperty(exports, name, { enumerable: true, get: getter });
	}
};
```

### 未配置

以下是 webpack 将 Vue3 编译后的 bundle.js 代码：

通过 `createApp` 可知此处 `vue__WEBPACK_IMPORTED_MODULE_0__` 为 Vue 相关对象：
```javascript
var app = Object(vue__WEBPACK_IMPORTED_MODULE_0__[/* createApp */ "d"])(_template_app_app_vue__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"]);
```

继续查找 `vue__WEBPACK_IMPORTED_MODULE_0__` 定义：
```javascript
var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(23);
```

再找一下编号为23的 `module`，代码中可以看到就是给 `__webpack_exports__` 进行属性赋值，也就是 `__webpack_require__()` 调用后输出的 `module.exports` 对象赋值。
```javascript
/* 23 */
(function(module, __webpack_exports__, __webpack_require__) {
    // ...
    __webpack_require__.d(__webpack_exports__, "d", function() { return _vue_runtime_dom__WEBPACK_IMPORTED_MODULE_1__["d"]; });
    // ...
});
```
通过上面提到的 `__webpack_require__` `__webpack_require__.d` 函数以及 `moduleId` 为 23 对应的模块代码，可以知道 `vue__WEBPACK_IMPORTED_MODULE_0__` 就是包含了一系列 Vue3 API 的对象，大概如下：
```javascript
{
    'd': createApp,
    // ...
}
```
对 npm 安装的 Vue3 编译之后大概流程就是在需要调用的地方通过 `vue__WEBPACK_IMPORTED_MODULE_0__["api"]` 执行对应 API。

**为什么编译成这种对象形式？可能和 tree shaking 有关**

### 已配置

以下是配置了 externals vue 后 webpack 输出的 bundle.js 代码：

通过 `createApp` 很明显知道这里是 Vue3 实例化的代码， `vue__WEBPACK_IMPORTED_MODULE_3__` 即 Vue3 对外接口对象:

```javascript
Object(vue__WEBPACK_IMPORTED_MODULE_3__["createApp"])(_loading_vue__WEBPACK_IMPORTED_MODULE_4__[/* default */ "a"], {
  config: reactiveDefalutConfig
}).mount(root);
```

继续查找 `vue__WEBPACK_IMPORTED_MODULE_3__` 定义：
```javascript
var vue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(23);
```

再找一下编号为23的 `module`，代码中可以看到就是给 `__webpack_require__()` 调用后输出的 `module.exports` 对象赋值。
```javascript
/* 23 */
(function(module, exports) { module.exports = Vue; });
```

moduleId 23 直接赋值 `module.exports` 为绑定在 window 下的 Vue3 全局对象，所以精简代码如下：
```javascript
// 执行 moduleId = 23 的模块，得到如下
module.exports = Vue;
// 执行 __webpack_require__(23) 得到如下
var vue__WEBPACK_IMPORTED_MODULE_3__ = module.exports;
// 最终
var vue__WEBPACK_IMPORTED_MODULE_3__ = Vue;
```

**变量赋值与未启用 externals 配置项编译输出的 bundle.js 中的逻辑如出一辙。**

## 总结
通过上面实例编译后的 bundle.js 代码分析可以看到，配置 externals 与否对应的就是编译后 Vue3 对象赋值逻辑不同，再看下 CDN Vue3 的代码：
```javascript
// https://cdn.bootcdn.net/ajax/libs/vue/3.2.33/vue.global.prod.js
var Vue=function(){...}
```
第一行便是声明一个全局 var 变量，默认直接挂载到 window 对象下。

**延申一下，配置了 externals 的库可以跨项目共享 http 缓存，因为使用 CDN 链接可以保持为同一个，挺好的一个优点。**
