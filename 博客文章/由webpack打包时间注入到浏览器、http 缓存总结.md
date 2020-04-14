## 问题由来

因为十月要庆祝国庆所以很多工作量被移到了九月来提前完成一点，这就导致了这个月上线项目比较多。公司前端整个架构都是通过 Jenkins 平台做的自动化打包的，此次遇到问题的项目是一个多页面项目，项目中有一个正则库去过滤不需要打包的某些页面，这时就有一个问题：多人开发中总是修改这个正则文件来加快打包时间，进而出现我的文件打包之后是否打包、是否刷新了CDN缓存都需要去线上、测试环境检查下是否修改了，因为这个文件有可能其他人把我开发的页面添加进去了，而我没注意，没有给项目名注释掉，等于打包时被跳过了没有进行打包。

## 解决办法

问题其实很简单，解决办法也很简单，就是去对应环境看下修改的内容是否生效就可以判断了。但是这里涉及到一个问题那就是这个BUG出错的复杂度问题，要是需要通过很多步骤交互才能复现的一个问题那么进行二次验证是很麻烦的，会很耽误事。因为这个工作应该是测试去检验的，相当于开发和测试重复做了一件事，而这么做的原因就是开发需要验证修改是否生效，而且不能说改没改都没确定（相当于打包成功没成功）就扔给测试了，这样不是一个负责任的表现。
当时任务比较多，这个问题就搁置了，这几天正好忙好了就处理下这个问题。解决时想了想这个问题直接在 `index.html` 中添加一个标识一目了然是何时打包不久解决了吗?随即开始动手

## 一、index.html中注入打包时间

既然要解决问题，那么最好的方式就是在 webpack 打包中通过 hook callback 修改中间处理的文件统一增加固定格式的时间注释，大概看了下项目 webpack 配置文件，最终在 'html-webpack-plugin' 这个插件做文章，因为它提供了生成 html 文件过程中的一些 hook callback，在这些 hook callback 中我们可以对 html 字符串做一些操作，比如解决这次问题的添加打包时间注释。

自定义 plugins 代码：
```javascript
/**
* 解决打包后判断线上页面是否打包并刷新缓存问题
*/
class HtmlCreateTimeComment {
    apply(compiler){compiler.plugin('compilation', compilation =>{

            compilation.plugin('html-webpack-plugin-after-html-processing', (html, callback)=>{

            //  打包时间
            const time = xxxx;

            html.html += `<!-- build time: ${ time } -->`;
                callback(null, html);
            });
        })
    }
}
```
plugins 中添加：
```javascript
plugins: [
    //  html 打包时间注入
    new HtmlCreateTimeComment()
]
```
再添加这个自定义插件后每次打包都会在 `index.html` 底部添加一行注释，注释的内容就是打包时间。截图如下：

![](https://www.ismoon.cn/static/b31b2c9bca91266b376ae1538494b215.jpg)

由此这个问题已经解决了。

解决的代码只有几行但是这过程中确实有点坑的，因为 `html-webpack-plugin` 这个插件 4.x 版本对 hook callback 进行了重构，不仅名字换了写法等也都不同。

**在4.x版本之下 html-webpack-plugin 提供了五个异步钩子一个同步钩子，而在4.x 版本六个钩子全部重构成了异步。**

### 1.html-webpack-plugin 不同版本钩子
**4.x 版本新钩子**

1.  beforeAssetTagGeneration

2.  alterAssetTags

3.  alterAssetTagGroups

4.  afterTemplateExecution

5.  beforeEmit

6.  afterEmit

[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

**4.x 以前版本钩子**

1.  html-webpack-plugin-alter-chunks **Sync**

2.  html-webpack-plugin-before-html-generation

3.  html-webpack-plugin-before-html-processing

4.  html-webpack-plugin-alter-asset-tags

5.  html-webpack-plugin-after-html-processing

6.  html-webpack-plugin-after-emit

[html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)

## 二、 http cache

问题已经解决了，但是这个问题是从打包中注入时间戳从而直截了当的判断是否打包成功、是否刷新了CDN缓存来处理的，当时编写 code 时就想到能不能通过 header 中得某些字段来判断当前得文件打包时间呢？
首相想到的就是几个 http cache 相关得字段，但是之前了解时都比较浅，对这几个字段具体得含义、何时变更都没有深入了解，这次针对学习下。

### 1、http cache 分类

http cache 总共分为两类，强缓存与协商缓存。两者的区别就是协商缓存会在使用缓存资源前请求服务器验证当前缓存资源是否过期与改动，而强缓存则是直接使用缓存资源而不向服务器通信验证。

### 2、 强缓存

强缓存是不与服务端通信，浏览器直接使用缓存资源的缓存策略。强缓存由一下字段控制：

1.  `Pragma: no-cache`

通用首部，HTTP 1.0 版本取消缓存控制字段，向 HTTP 后续版本兼容。与 `Cache-Control: no-cache` 行为一致：** 强制与服务端通信验证缓存是否可用。**

1.  `Expires: <http-date>`

响应头首部，HTTP 1.0 版本控制缓存字段，向 HTTP 后续版本兼容。`Expires` 的值是一个相对于服务器时间的时间戳，也就是说客户端本地时间会直接影响 `Expires` 控制缓存的行为。

1.  `Cache-Control：`[值比较多，贴出链接](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control)

通用首部，HTTP 1.1版本控制强缓存策略的字段，`Cache-Control` 的值很多，比较常用的有 `max-age=<seconds>，no-cache，no-store`。

`max-age=<seconds>:` **相对于客户端本地时间的一个值，单位是秒。** 这里修正了 `Expires` 这个服务器与客户端时间不同步问题，因为是相对于客户端本地时间自然不存在不同步问题。

`no-cache :` 强制与服务端通信验证是否缓存资源是否过期与改动。

`no-store :` 不使用缓存。

### 2、 协商缓存

协商缓存是浏览器没有命中缓存资源后另外一种缓存策略，浏览器携带部分控制字段与服务器通信，服务器验证这些字段或者本身资源没变的情况下通知浏览器资源未改变可以继续使用缓存资源。此通信过程中没有数据资源的传输，所以传输流量很低，占用服务端资源很少。

协商缓存由一下字段控制：

1.  `If-Modified-Since：<http-date>`

请求首部，HTTP 1.1 版本协商缓存控制字段。`If-Modified-Since` 的值为上次请求时响应头中 `Last-Modified` 字段返回的值，此值为此资源在服务器中最后修改的时间，服务器重启此时间重置更新。这个字段代表：**超过指定时间** `<http-date>` 后资源更新了服务器则接受此请求，没有更新则返回304，**只可以用在 GET 或 HEAD 请求中，精度为秒级。**

1.  `Last-Modified ：<http-date>`

响应首部，HTTP 1.1 版本协商缓存控制字段。`Last-Modified` 的值为当前请求的资源在服务器中最新修改的时间。

1.  `ETag：<etag_value> | W/<etag_value>`

响应首部，HTTP 1.1 版本协商缓存控制字段。`ETag` 的值叫做验证器，分为强弱两种，其实它相当于文件的指纹。强验证器会按照资源字节去生成，弱验证器则是选择资源内容去生成，而不是每个字节。**验证器与修改的时间无关，文件内容相关。**

1.  `If-None-Match : <etag_value>`

请求首部，HTTP 1.1 版本协商缓存控制字段。`If-None-Match` 的值为上次请求时 `ETag` 的值。这个字段代表：**当前的验证器与服务端的 `etag_value` 不匹配则服务端接受此请求。**

上面 `If-Modified-Since` 与 `Last-Modified` 是一对，通过一个时间戳在服务端校验，当强缓存没有命中时通过此字段与服务端匹配。那么有这两个字段了为什么还要 `ETag If-None-Match` 这一对呢？原因有二

1.  **服务器中某个资源更新了，实际上内容没变，这时客户端缓存并不需要更新，但是 `If-Modified-Since` 的值会改变，导致这个资源被重新下载一遍，即使内容完全一样。**
1.  **`If-Modified-Since` 精度在秒级，服务端改动某资源异常频繁，客户端需要同步更新，此时秒级不太精确。**

在上述两个问题下，`ETag` 的文件内容相关性则突出出来了，只要内容改变 `ETag` 必定改变，从而在客户端请求时每次更新新的资源。

在一个 HTTP 请求中 `If-None-Match` 的优先级大于 `If-Modified-Since`，同时出现后者被忽略。

## 三、总结

在深入了解 HTTP cache 后发现：对于这次的打包问题可以通过 `If-Modified-Since` `Last-Modified` 这一对来判断当前的资源是否更新了。不过很坑的一点是这一对字段在服务器重启等等都会更新，会出现不准的情况。而且时间显示也不很人性化，再加上公司业务原因存在时区问题，每次都要换算确实很麻烦，所以综上考虑 webpack 打包中的时间戳功能就没有进行删除。

每次的问题都是学习的切入点，在深入了解 HTTP cache 相关知识点后再遇到一些类似缓存问题都游刃有余了。

**http 缓存保存位置的区别， 浏览器的数据缓存，server worker 缓存等等一些相关发散的知识点这次大概看了下，没有深入，此次文章不做记载。**