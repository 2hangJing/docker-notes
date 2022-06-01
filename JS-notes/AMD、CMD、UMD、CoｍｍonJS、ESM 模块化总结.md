
# 前端模块化方案梳理
 `AMD` `CMD` `UMD` `CommonJS` `ESM` 

## AMD
全称 **Asynchronous Module Definition 异步模块定义**，异步加载模块不阻塞后续 JS 运行。 基于此规范实现的有 `require.js` `curl.js`。

**模块系统中不需要写 `.js` 后缀**

### 定义、导出模块
通过 `define()` 函数定义模块，示例：
```javascript
// 定义一个依赖 JQ 的模块
define(['jquery'], functio(){
    return {md: 'AMD'};
});
```

### 导入模块
通过 `require()` 函数导出模块，同时 `require.config()` 函数可以定义一些公共配置 `paths` `shim` `baseUrl` 等。示例：
```javascript
// 配置
require.config({
    baseUrl: "xxx/js",
    paths: {
        // 完整路径为 xxx/js/jquery.min.js
        'jquery': 'jquery.min',  
    }
});
// 导入模块
require(['jquery'], function($){
    // xxx
});
```

**require.js 在定义模块时会把依赖模块加载完后直接执行模块，示例:**
```javascript
define(['a', 'b'], function(a, b) {
    // 此时依赖库 a.js b.js 都加载并执行完毕
});
```

还有一些其他特性比如：加载失败后备用库、加载顺序等等。细节不再赘述，`AMD` 也基本退出前端舞台了。

**参考**
1. <https://www.runoob.com/w3cnote/requirejs-tutorial-1.html>
2. <https://www.runoob.com/w3cnote/requirejs-tutorial-2.html>
3. <https://requirejs.org/docs/api.html>

## CMD
全称 **Common Module Definition 通用模块定义**，同样是异步加载模块不阻塞后续 JS 运行。基于此规范实现的有 `seaJS`。

**模块系统中不需要写 `.js` 后缀**

### 定义模块
在 `CMD` 规范中，一个模块就是一个文件。模块代码包含在 `define` 函数中：
```javascript
define(factory);
```

### 导出模块
当模块代码 `define(factory)` 参数 `factory` 为对象、字符串时，表示模块的接口就是该对象、字符串，示例：
```javascript
define('seaJS');
```
参数 `factory` 为函数时，表示是模块的构造方法。执行该构造方法，可以得到模块向外提供的接口。
```javascript
define(function(require, exports, module) {
  // 模块代码
});
```
使用 `return` 或者是 `exports.xx` 导出。
```javascript
define(function(require, exports, module) {
    return {md: 'CMD'};
});

define(function(require, exports, module) {
    exports.md = 'CMD';
});

define({md: 'CMD'});
```
**`factory` 为函数时参数 `exports` 为 `module.exports` 的引用，当导出的模块为一个类时，直接赋值给 `exports` 是无效的，必须赋值给 `module.exports`，示例：**
```javascript
define(function(require, exports, module) {
    // 这是错误的！！只会重新给当前 factory 中 exports 赋值。
    exports = new XX();
    // 这是正确的，但是导出的类绑定到 key XX 上。
    exports.XX = new XX();
    // 通过 module.exports 直接导出类
    module.exports = new XX();
});
```

通过 `define.cmd` 来判定当前页面是否有 CMD 模块加载器，示例：
```javascript
if (typeof define === 'function' && define.cmd) {
    // 有 Sea.js 等 CMD 模块加载器存在
}
```

### 导入模块
模块代码 `define(factory)` 中 `factory` 为函数时有三个默认参数，第一个便是 `require`，通过 `require` 导入模块，示例：
```javascript
define(function(require, exports, module) {
    let $ = require('jQuery');
});
```
`require` 为同步执行，还可以使用 `require.async` 在模块内异步加载其他模块，加载完成后执行 `callback`，示例：
```javascript
define(function(require, exports, module) {
    require.async('jQuery', function($){
        // 加载完毕
    });
});
```

### 与AMD不同点 
`AMD` 规范下执行 `define` 定义模块时如果依赖其他模块会加载并执行所有依赖模块，但是 `CMD` 则是在需要使用其他依赖库时再加载，示例：

**AMD**
```javascript
define(['a', 'b'], function(a, b) {
    // 此时依赖库 a.js b.js 都加载并执行完毕
});
```
**CMD**
```javascript
define(function(require, exports, module) {
    // 需要什么模块加载什么模块
    let a = require('a');
});
```

**参考**
1. <https://github.com/seajs/seajs/issues/242>
2. <https://seajs.github.io/seajs/docs/#docs>

## CommonJS
`CommonJS` 规范主要应用浏览器外的 `javascript` 环境，因为其是同步加载模块，资源在本地磁盘时不需要网络传输从而保证了速度。`NodeJS` 的模块系统采用 `CommonJS` 规范。

`CommonJS` 有如下规则：

1. 所有代码都运行在模块作用域，不会污染全局作用域。
2. 模块可以多次加载，但是只会在第一次加载时运行一次，然后运行结果就被缓存了，以后再加载，就直接读取缓存结果。要想让模块再次运行，必须清除缓存。
3. 模块加载的顺序，按照其在代码中出现的顺序。
4. `CommonJS` 导入的模块为拷贝值。也就是说，一旦输出一个值，导出模块内部的变化就影响不到导出值。

### 模块定义、导出
每个模块（.js文件）内部都有一个 `module` 对象，通过 `module` 对象进行导出，示例：
```javascript
let md = 'CommonJS';
module.exports = md;
```
`module` 对象有如下属性:
1. `module.id` 模块的识别符，通常是带有绝对路径的模块文件名。
2. `module.path` 模块的目录名称。 这通常与 `module.id` 的 `path.dirname()` 相同。
3. `module.paths` 模块的搜索路径。
4. `module.filename` 模块的文件名，带有绝对路径。
5. `module.loaded` 返回一个布尔值，表示模块是否已经完成加载。
6. `module.parent` 返回一个对象，表示调用该模块的模块。
7. `module.children` 返回一个数组，表示该模块要用到的其他模块。
8. `module.exports` 表示模块对外输出的值。

也可以通过 `exports` 进行导出：
```javascript
let md = 'CommonJS';
exports.md = md;

// 这是错误的！！ 会导致 exports 与 module.exports 关联消失。
// exports = {md}
```

**exports 与 module.exports 区别**

实际上 `exports` 就是指向 `module.exports`，简化开发代码，示例：
```javascript
// true
exports === module.exports;
```

### 导入模块
通过 `require()` 函数导入模块，示例：
```javascript
let md = require('./md.js');
```
因为 `CommonJS` 只有导入模块第一次时执行代码，后面会缓存模块。所以需要每次导入模块时都执行模块代码则需要删除模块缓存，示例：
```javascript
require('./md.js');
// 删除模块缓存
delete require.cache[module.children[0].id];
// 再次执行
require('./md.js');
```
上面代码总共执行了两次 `md.js`。

**参考**
1. <http://javascript.ruanyifeng.com/nodejs/module.html#toc0>


## UMD
全称 **Universal Module Definition 通用模块定义** ，`UMD` 规范主要是兼容 `AMD` `CommonJS` 规范而出现的。`UMD` 规范实现中有很多版本，并不只是一个。

`UMD` 通过 `define()` 函数与 `module` 对象进行模块判断，并对应处理。其中最常用的 `returnExportsGlobal.js` 规范如下：
```javascript
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['b'], function (b) {
            return (root.returnExportsGlobal = factory(b));
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require('b'));
    } else {
        // Browser globals
        root.returnExportsGlobal = factory(root.b);
    }
}(typeof self !== 'undefined' ? self : this, function (b) {
    // Use b in some fashion.

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return {};
}));
```
原理很简单
1. 判断 `typeof define === 'function' && define.amd` 是否有 `AMD` 规范加载器
2. 通过 `module === 'object' && module.exports` 判断为 `CommonJS`
3. 剩下绑定到 `root` 即 `window` 上。`self` 属性多为判断是否为 `iframe`，不在 `iframe` 中 `self === window`。 

**参考**
1. <https://github.com/umdjs/umd/blob/master/templates/returnExportsGlobal.js>

## ESM
`ESM` 指 `ES6 Moudle` 规范，在 `javaScript` 语言标准上实现的模块规范，日常开发常用不再记录。

**详细规则**
1. <https://es6.ruanyifeng.com/#docs/module>