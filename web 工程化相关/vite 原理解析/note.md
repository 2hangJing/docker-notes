
# Vite 浅析

## 简介
Vite 与 webpack 同是前端构建工具，随着前端不断发展 webpack 的设计理念已经渐渐落后，Vite 便是后起新星之一。

在一些大型、有多个复杂模块的项目中 webpack 编译时间会随着项目模块增多而直线上涨，暴露出最直接的问题就是本地开发时效率低下。

Vite 转而利用 ESM、懒加载、模块缓存等诸多优化点大幅提高了本地开发效率。但是基于浏览器历史版本问题线上环境依旧使用 Rollup 编译打包，而不是使用 ESM。

### ESM 简略

ESM 是 ES6 在 javascript 语言层面上实现的模块系统，开发中也比较常用，但是在浏览器端运行的都是依托 webpack 编译后的 bundle.js，一般来说都不是 ESM。

浏览器中直接使用 ESM，需要加上 `type="module"`，如下：

```html
<script type="module">
  import app from '/xx/app.ts
  // some code
</script>
```
浏览器在遇到 `import app from '/xx/app.ts'` 时会发起一条 http 请求，请求的就是 `'/xx/app.ts'`。

**ESM 细节参考 <https://es6.ruanyifeng.com/#docs/module-loader>**

## Vite 原理

### 1. 基于 ESM 

webpack 工程的项目不管是本地开发还是线上部署都需要编译所有模块，输出最终 bundle.js 才能进行访问，原因之一便是 webpack 需要将代码中基于: AMD、UMD、CommonJS、ESM 模块构建成一套 webpack 自己的、统一的模块系统。这就间接导致了本地开发启动服务时间与代码量正相关。

**所有模块编译完毕后提供服务**
![alt 属性文本](./bundler.png)

此方面 Vite 则是与之完全不同，相对于 webpack 的模块系统，Vite 所使用 ESM 不需要提前编译所有模块，浏览器根据代码中 import 去请求对应的文件/模块，Vite 服务端根据请求 path 处理对应文件/模块，从而实现了 **'懒编译'**，这也是 Vite 本地开发启动速度非常快的原因之一。

**先提供服务，按需动态编译**
![alt 属性文本](./esm.png)

### 2. 依赖解析

Vite 服务端在返回 ESM 前需要对部分 import 路径重写，因为项目代码中有许多裸模块导入：

```javascript
import axios from 'axios';
```
此时浏览器直接请求 axios 会报错：

> Uncaught TypeError: Failed to resolve module specifier 'axios'. Relative references must start with either '/', './', or '../'.

Vite 需要将其转换成正确的路径：
```javascript
import axios from '/node_modules/.vite/deps/axios.js?v=8b727dc7';
```

### 3. 预构建与缓存

#### Ⅰ. 转换 UMD、AMD、CommonJS 模块为 ESM

node_modules/axios 包中 dist 文件是通过 UMD 导出，lib 源码通过 CommonJS 导出，如下：

node_modules/axios/index.js 示例（CommonJS）：
```javascript
module.exports = require('./lib/axios');
```
对应的 .vite 缓存目录下已转换模块的代码如下（ESM）：
```javascript
import { __commonJS } from './chunk-VORV6RSN.js';
// node_modules/axios/index.js
var require_axios2 = __commonJS({
  'node_modules/axios/index.js'(exports, module) {
    // ...
    module.exports = require_axios();
  }
});

// dep:axios
var axios_default = require_axios2();
export { axios_default as default };
```
可以看到已经把 CommonJS 转换为 ESM 了，具体转换实现参考 .vite/deps/chunk-VORV6RSN.js。

#### Ⅱ. 多个依赖模块构建成一个 ESM

很多时候，一个模块中会引用其他模块，而其它模块又会引用更多的依赖模块，如果 Vite 将每个模块都转换成对应的 ESM，那么在浏览器请求时会发出几百上千条 http 请求，这显然是有问题的。

Vite 通过将同一个模块的依赖构建到一个 ESM 解决这个问题，还是 axios 为例：

node_modules/axios/index.js 示例：

![alt 属性文本](./axios%20%E6%BA%90%E7%A0%81.jpg)

Vite 处理后的 axios 模块如下：

![alt 属性文本](./vite%20%E6%9E%84%E5%BB%BA%20axios%20%E6%BA%90%E7%A0%81.jpg)

#### Ⅲ. 缓存

Vite 预构建一次依赖模块后会缓存到 /node_modules/.vite/deps 目录下，如果依赖模块版本没有改动、未手动配置则下次启动 Vite 服务时不再对此模块预构建，从而再次减少启动时编译时间。

在本地文件缓存的同时会设置预构建的模块 response header: `Cache-Control: max-age=31536000,immutable` ，利用 http 强缓存再次增加响应速度。

![alt 属性文本](./%E7%BC%93%E5%AD%98-%E9%A2%84%E6%9E%84%E5%BB%BA%E6%A8%A1%E5%9D%97%E5%BC%BA%E7%BC%93%E5%AD%98.jpg)

#### Ⅳ. Esbuild

Vite 使用 esbuild 预构建依赖。Esbuild 使用 Go 编写，并且比以 JavaScript 编写的打包器预构建依赖快 10-100 倍。

Vite 使用 esbuild 将 TypeScript 转译到 JavaScript，约是 tsc 速度的 20~30 倍。


### 3. .vue 文件处理 

Vite 并不是像 webpack 一样将 .vue 文件编译成 bundle.js，而是直接让浏览器请求 .vue 文件，通过请求 path 判断将 .vue 文件分成三部分，以下代码为示例：

项目源码，main.ts：
```javascript
import App from './app.vue';
```
Vite 构建后的代码：
```javascript
import App from '/src/template/app.vue';
```
浏览器的请求链接：

`http://192.168.1.3:3000/src/template/app.vue`

Vite 服务端返回：
```javascript
import ts from '/src/template/app.ts';
import '/src/template/app.vue?vue&type=style&index=0&lang.scss'
// ...无关代码省略
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  // ...无关代码省略
}
```
从 Vite 服务端返回代码可以看到，一个 .vue 文件被拆分成如下：

**1. template: 直接由 `_sfc_render` 函数渲染 DOM。**

**2. js: `import ts from 'xx/app.ts'`，浏览器会再次发起一个 http 请求，请求 app.ts。**

请求如下图所示：

![alt 属性文本](./vue%20%E6%96%87%E4%BB%B6%E6%8B%86%E5%88%86-ts%20%E8%AF%B7%E6%B1%82.jpg)

返回的是 ts 编译成的 js 代码：

![alt 属性文本](./vue%20%E6%96%87%E4%BB%B6%E6%8B%86%E5%88%86-ts%20%E8%BF%94%E5%9B%9E.jpg)

**3. css: `import 'app.vue?vue&type=style&index=0&lang.scss'`，浏览器会再次发起一个 http 请求，请求 css。**

css 请求流程同 js 文件，依旧是 ESM 形式，只不过 css 以字符串变量形式被返回，最终在 template render 时解析。

## 总结

### 优点
基于 ESM 实现了正真的按需编译，再配合缓存优化与 Esbuild，减少了冷启动时间，大幅提高开发效率。

### 缺点
1. 即使有预构建，但是项目源码并不能合并一起从而导致 http 请求过多，不过这在项目开发时无关痛痒。
2. 浏览器对 ESM 的支持导致线上环境有风险，还是要采用 wbepack、Rollup 编译部署。 


**参考**
1. <https://vitejs.cn/guide/>
2. <https://zhuanlan.zhihu.com/p/467325485>
