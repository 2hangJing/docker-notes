<!--
* @Author: monai
* @Date: 2020-05-09 18:37:59
 * @LastEditors: monai
 * @LastEditTime: 2020-05-11 10:47:55
-->
> [**Blob, FileReader, responseType, btoa,atob解码, 文件操作转化,知识点梳理（一）**](http://www.ismoon.cn/article_detail?id=17)<div>总结太长分为俩个文章记录。</div>

## 四. FileReader梳理

FileReader，一个提供异步读取本地文件的对象，这里的**读取**指的是将**文件读进内存中。**

读取本地文件的对象？ input file 不是就是做这件事的嘛？为什么还要再来一个FileReader ？

答案就是：

**input 选择文件返回的 fileList数组中file 对象是这个已选择文件的信息，包括这个文件的系统路径！！**

**并不是将选择的文件读取到内存中等待使用！！**

在使用input file 时有没有好奇过为什么 change事件选择一个几M的图片也是无延时的，没有load事件就可以同步获得文件？?

因为整个代码同步执行，文件也没有读取到内存中。

翻阅无数博客、MDN等等都没有提到 FileReader 这个读取文件的对象为什么不是集成在file对象中，而需要单独存在，一直迷惑。

在实验过后明白了原因。

这里放一下验证的流程以及截图，有兴趣的可以自己尝试：

### 1. FileReader与input file读取文件区别验证

验证思路：通过chrome自带的任务管理器观察chrome占用的内存来判断是否将一张1.54M的图片读进内存。

**code：**
```html
<body>
    <input id='file' type='file'>

    <button id='f'>查看已选择文件</button>

    <button id='fr'>FileRader加载</button>
</body>
```
```javascript
$('#f').on('click',function(e){

    console.log($('input')[0].files);            //查看文件信息
})

$('#fr').on('click',function(e){

    let fr = new FileReader();

    fr.readAsDataURL($('input')[0].files[0]);    //将文件读取到内存中``
    fr.onload = function(){  console.log('加载完毕');  }
})
```

**初始状态 --> 测试网页chrome 内存占用图：**

![](https://www.ismoon.cn/static/25f94601348ae7ff4b3fa50e7005b9a9.jpg)


**图片大小图：**

![](https://www.ismoon.cn/static/f1eb45c6200edfb6af113474046cbd90.png)**

**通过input file 上传图片 -->测试网页chrome 内存占用图：**

![](https://www.ismoon.cn/static/1eaee7f1537dad629a245ed70acf43a1.png)

**加载一次FileReader -->测试网页chrome 内存占用图：**

![](https://www.ismoon.cn/static/0ea4db62ba0345d38ac9c1ae8df81279.png)

**加载二次FileReader -->测试网页chrome 内存占用图：**

![](https://www.ismoon.cn/static/f4fe0a142b15cd3c74d6a899ed6193e0.png)

**加载三次FileReader -->测试网页chrome 内存占用图：**

![](https://www.ismoon.cn/static/9f7d94c8bfce60400e12a16e424c6965.png)

可以看到每次点击一次 'FileReader加载' 按钮，内存增加 1.5M+。

至于为什么不是准确的图片大小，可能chrome做了一些底层操作，我们并不知道，但是这并不影响这个实验的结果，因为我们可以在准确的时间来增加内存，完全可以说明是这张图片被读取到内存中所占用导致的内存增加。

以上测试可以证明 input file 上传时只是将文件路径、大小等信息存储到 file 对象中，只用通过 FileReader 才是真的将文件读取到内存中。

### 2. FileReader 实例化以及API

作为一个对象不用说 new 操作符走起

**实例化：**
```javascript
let fr = new FileReader();
```
FileReader的属性不多，只有三个。

**属性：**

1.  fr.error 返回读取文件时发的错误。
2.  fr.readState 返回一个Number，三个值0、1、2 分别表示未加载、加载中、加载完毕。
3.  fr.result 返回加载的资源。

**方法：**

1.  fr.abort() 中断读取操作。
2.  fr.readAsArrayBuffer( [file，Blob]) 读取文件并将文件以ArrayBuffer格式存储到 fr.result中。
3.  fr.readAsBinaryString([file，Blob]) 根据MDN展示，目前已废弃。
4.  fr.readAsDataURL( [file，Blob]) 将文件读取为 DataURL 格式存储到 fr.result中。
5.  fr.readAsText( [file，Blob]，encoding) 将文件读取为字符串格式存储到 fr.result中。

**事件：**

1.  fr.onabort 中断时触发。
2.  fr.onerror 读取错误时触发。
3.  fr.onload 读取完毕后触发。
4.  fr.onloadstart 读取开始时触发。
5.  fr.onloadend 读取操作结束时触发，无论成功、失败都会触发。
6.  fr.onprogress 读取中触发。

## 五. Data URLs、Base64编码

自从有了 FileReader 后，大多数做图片上传预览的网站都是通过将 file 对象通过 fr.readAsDataURL 转化为一个Data URL （更多的会说转化成Base64格式）赋值给 img 的 src，现在就来说说这个 fr.readAsDataURL 返回的字符串。

### 1. Data URLs

Data URLs 顾名思义它首先是一个 URL，再者这个 URL 本身包含有数据信息。

所以这个 Data URLs 可以在文档中嵌入一些文件，最常见的就是很小的图标用 data:image/jpeg;base64,/xxx... 表示，当 HTML 被请求时这个 Data URL 会随着文档下载，与普通的图片单独用一个 HTTP 会话请求有很大差别。

一个完整的 Data URLs 格式是这样的 `data:[<mediatype>][;base64],<data>`

1.  data: 前缀。
2.  mediatype：MIME String，表示这个 Data URLs 所代表的文件类型，默认值为：text/plain;charset=US-ASCII
;base64：携带的数据是否经过 Base64 编码，像fr.readAsDataURL返回的 Data URLs 所包含的图片信息就是Base64 编码之后的数据。
1.  `<data>`：携带的数据。

上面说到 'Data URLs 顾名思义它首先是一个URL'，既然是一个 URL 那么自然可以在浏览器的地址栏输入：
`data:text/html;charset=UTF-8,<h2>Moon的客栈</h2>`

输入之后可以看到一个 H2 标签的 Moon 的客栈。

> DataURL 标准收录在RFC2397。DataURL 标准[RFC2397](https://tools.ietf.org/html/rfc2397)

### 2. Base64编码

base64编码的出生是为了解决一些二进制字符无法展示这个问题的，简单地说就是各种二进制字符都会被按照一定的规律转换成可见的64个字符来存储。

它由64个可显示字符组成，分别为：[0...9, a...z, A...Z, /, +]。

因为数据都转换成这 64 个字符，所以在未设置编码、设置错误编码...等等环境下也可以正常的展示出来。从而通过解码获得数据中存储的信息。

举个例子：上面提到的 fr.readAsText 我们上传一张图片但是我们用字符串来显示出来。

![](https://www.ismoon.cn/static/abe1c0e1de430a984a4a11146adbe69e.png)

由图中可以非常清楚地看到了各种不可展示的二进制字符被”�、“替换。

如果别人给你发一段这样的数据，恐怕你是不知道这是想表达什么。

如果我们使用使用 fr.readAsDataURL 来处理获得的数据。

![](https://www.ismoon.cn/static/4064e1141c5662f458c6aaafd6f006d2.png)

很明显不再出现那些没法显示的二进制字符了。

Base64 因为只含有 64 个字符，所以最大的索引 63 转换成二进制为：111111 ，只用 6 bit 就可以存储。

但是不管是 ASCII 还是 Unicode 编码一个字符占用一个字节也就是 8bit，由此 Base64 便使用原数据 3 个字节为一组也就是  3\*8=24bit，转换为4组 4\*6=24bit 方式来进行对应存储。

由此造成的问题就是体积增大，因为 4 组只有 6bit 有效，有 2bit 填充 0，所以体积增大33%。

具体转换流程用一张网图展示：

![](https://www.ismoon.cn/static/3922fb1f0f9de41a7ea5030fc42e5e64.png)

### 3. atob、btoa API

JavaScript本身带有Base64编码、解码API：

1.  window.btoa( str ) --> Base64编码
2.  window.atob( base64 ) --> Base64解码

这俩个API有一定局限，不可以转中文字符，对待中文字符时抛出错误：

![](https://www.ismoon.cn/static/f652cded32ae7b8416fab62ff06ee348.png)

解决办法就是对中文字符进行 encodeURI('Moon的客栈');

## 六. 数据转化总结、实例

**1. http图片资源转本地ArrayBuffer**
```javascript
let xml = new XMLHttpRequest();

    xml.responseType = 'arraybuffer';

    xml.open('GET','https://www.ismoon.cn/static/f40c9fa28a2ad1df8e3b2482eeb6d265.min.600.jpg',true);

    xml.send();

    xml.onreadystatechange = function(){

        if (xml.readyState==4 &amp;&amp; xml.status==200){

            let imgArr = xml.response;
        }
    }
```

**2. ArrayBuffer 转 Blob**
```javascript
let imgBlob = new Blob([imgArr]);

console.log(imgBlob);
```

**3. Blob转资源URL**
```javascript
let img = new Image();

img.src = window.URL.createObjectURL(imgBlob);

document.body.appendChild(img);
```

**3. String转Blob**
```javascript
let str = 'Moon的客栈';

let strBlob = new Blob([str]);

console.log(strBlob);
```

**4. Blob转String**
```javascript
let fr = new FileReader();

fr.readAsText(strBlob);

fr.onload = function(){

    console.log(fr.result);
}
```

**5.Blob转blob URL资源链接**
```javascript
let url = URL.createObjectURL(strBlob);

console.log(url);
```

**6.Blob、file转DataURL**
```javascript 
let fr = new FileReader();

fr.readAsDataURL(strBlob);

fr.onload = function(){

    console.log(fr.result);
}
```

## 七.总结

通过这几天的学习、记录，基本前端一些常用的文件类转化操作都梳理清楚了。
最近了解的音频类API真的种类繁多，配合 ArrayBuffer 可以把一个音频的能量频谱可视化展示出来，很有意思。
> [音乐频谱可视化](http://www.ismoon.cn/audio)