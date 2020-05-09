> [**Blob, FileReader, responseType, btoa,atob解码, 文件操作转化,知识点梳理（二）**](http://www.ismoon.cn/article_detail?id=18)总结太长分为俩个文章记录。

## 一. response<wbr>Type设置类型以及功能

> MDN关于responseType的链接为：[responseType](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/responseType)

responseType 是ajax设置返回数据的类型，设置方法为：

```javascript
let xml = new XMLHttpRequest();

xml.responseType = 'blob';
```
responseType 含有的所有值，以及对应返回数据类型为：

| 值              | 返回值类型                                        |
|-----------------|----------------------------------------------|
| ''              | DOMString。这也是默认值，JS中 DOMString 可以理解为 String |
| arraybuffer     | 返回 ArrayBuffer 数据                            |
| blob            | 返回 Blob 数据                                   |
| document        | 返回 Document 格式数据                             |
| json            | 返回 JSON 对象                                   |
| text            | 返回 DOMString 格式数据，与不设置值返回相同。         |

以上表格中展示的是通用属性，除了这几个值之外还有'moz-blob'、'moz-chunked-text'、'moz-chunked-arraybuffer'、'ms-stream' 这几个值。从这几个值的格式也可以看到都是各个浏览器兼容提案，也就是说兼容性有比较大的问题，这里不做记录，只是简短说明一下。

1.  moz-blob ： Firefox独有，它可以在 progress 事件中检索已下载Blob数据，从而可以在接收数据时便开始处理数据。
2.  moz-chunked-text：Firefox独有，与 'moz-blob' 相同，在返回 text 类型值时支持 progress 事件中边下载边处理已下载的值。
3.  moz-chunked-arraybuffer：Firefox独有， 同上。
1.  ms-stream：IE独有，效果同上。

虽然这四个值没有被标准化，但是我在测试的时候，**现在连支持他们的浏览器都不再支持！！！** 坑货无疑。
> 测试用浏览器：Firefox Quantum 61.0.1。

## 二. JavaScript 类型数组（[Typed Arrays](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Typed_arrays)）知识点

Typed Arrays 类型数组，与JavaScript Array数组相比，读取速度更快、并且只存储原始二进制数据。那么这个 Typed Arrays 类型数组作用是什么呢？

从 MDN 解释以及存储的数据中可以看出来此数组主要服务于音频、视频操作，对于平时的开发意义不大。

Typed Arrays 分为 缓冲、视图 俩部分，缓冲即常说的 ArrayBuffer 担当，视图由 getInt8、getInt16....等多个组成。不管是视图还是缓冲官方解释的相当抽象，下面来具体解释一下这俩个是什么、干什么用的。

### 1. ArrayBuffer

在Typed Arrays 类型数组中担当 **缓冲** 部分。说白了，这就是一个数组只不过这个数组有点特别。

第一：不能直接访问，就是说常用的 `arr[i]` 等无法直接获取其中的数据，只有 视图 可以对其数据进行操作。

第二：长度固定，一旦实例化一个 ArrayBuffer 后，无法在更改其大小。

第三：只存储二进制原始数据。

那为什么管这个 ArrayBuffer 叫 缓冲呢？

因为内存中分为 **堆** 和 **栈。** **堆** 空间的内存是动态分配的，一般存放JavaScript对象。**栈**空间的内存由系统自动分配，一般存放局部变量等。而一般的 JavaScript 数组存放于 **堆** 中，而 ArrayBuffer 则存放于 **栈** 中。这就不难解释 ArrayBuffer初始化大小后无法更改和读取速度更快的特点了。ArrayBuffer 的实例化以及部分对外属性接口，实例化为：
```javascript
let arrBuf = new ArrayBuffer(10);
```

ArrayBuffer 有一个 length 属性
```javascript
console.lg( arrBuf.length ); // 10
```

更多关于 ArrayBuffer 详细属性、方法MDN链接为[ArrayBuffer。](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

### 2. DataView 视图

前面说了 缓冲 ArrayBuffer 现在来说说视图，所谓的视图，其实就是可以操作 ArrayBuffer 的方法而已.....并不是广义上的”视图“。

ArrayBuffer 没有直接的方法可以修改存储的数据，视图就是为了操作 ArrayBuffer中的数据而生。

DataView 实例化为：
```javascript
let dav = new DataView(buffer [, byteOffset [, byteLength]]);
```

buffer： 需要被操作的 缓冲，即 ArrayBuffer。

byteOffset：操作起始点，也就是实例化后，day.getInt8() 等等操作的起始点。默认位置0。

byteLength： 被操作 ArrayBuffer 中字节的长度。默认 ArrayBuffer.length。

> 更多关于 DataView 详细属性、方法MDN链接为[DataView。](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView)

实例化之后，便确定了 ArrayBuffer 需要被操作的 ArrayBuffer、起始点、被操作部分长度。DataView 最缓冲的操作分为俩种：**取、改**。

#### Ⅰ. 计算机中存储

计算机内存中，存储空间的基本计量单位为字节byte，1 byte为8位0、1表示，下图为 249 8位二进制表示：

![](https://www.ismoon.cn/static/00f0432251c645a7b68161d769956031.png)

可以看到1个字节byte 存储无符号位二进制数据可以表示 0~255，存储有符号位（第一位为符号位，1负0正）二进制数据可以表示 -128~127。

知道了关于字节存储的知识，就可以很简单弄懂 DataView 几个设置、获取的方法功能了。

#### Ⅱ. DataView获取ArrayBuffer值

DataView 获取 ArrayBuffer 的值方法总共有 8 种，分别为：
```javascript
let dav = new DataView(buffer [, byteOffset [, byteLength]]);
dav.getInt8( arg );

// 参数 arg 需要为整数类型  获取一个字节有符号8位二进制，即有效数字位为 7位，范围为（十进制）：-128 ~ 127。
// 1000 0000 即-0 被强制认为 -128。
dav.getUint8( arg )  

// 参数arg需要为整数类型  获取一个字节无符号8位二进制，即有效数字位为 8位，范围为（十进制1）：0 ~ 255
// 依此类推
dav.getInt16( arg )
dav.getUint16( arg )

dav.getInt32( arg )
dav.getUint32( arg )

dav.getFloat32( arg )   // 参数arg需要为浮点类型
dav.getFloat64( arg )
```
实例说明：
```javascript
// 实例化一个存储 10 个字节的缓冲，默认填充的为0，即 0000 0000 0000 ......。
let arrBuf = new ArrayBuffer(10); 

// 实例化一个 arrBuf 视图
let dav = new DataView(arrBuf);

// 存储一个十进制200。200被转化为二进制 1100 1000 存储到 arrBuf 第一个字节(8位)中。
dav.setInt8(0,200);

// 获取 arrBuf 第一个字节中存储的8位数据，并且转化为 十进制 输出。
day.getInt8(0);                   
```
上面的代码获取之后输出为多少呢？**-56**

为什么不是 200 ？

因为这里涉及到了符号位，取出数据时用的 `getInt8()`，即表示获取的二进制数据第一位为符号位，200 的二进制为 1100 1000，根据 **符号位1负0正** 原则 这是一个负二进制数，从而根据二进制转十进制原理，对 **非符号位取反** 即 1100 1000 --> 0110 111(符号位不参与)，再 **+1操作** 0110 111 --> 0111 000 --> 56 ，带上 **符号位** 最终得到 -56。

那么如何得到原来存储的 200 呢？使用 getUint8()，获取数据。

这个例子中如果替换 getInt8() 使用 getInt16(0) 呢？ 这是获取俩个字节数据，即16位数据，arrBuf 默认填充的 0，所以获取的后一个字节（后8位）全部是 0。其他的取反等等均为上述流程。

#### Ⅲ. DataView 设置 ArrayBuffer值

设置与获取类似也是 8 方法，分别为：

```javascript
let dav = new DataView(buffer [, byteOffset [, byteLength]]);

dav.setInt8( arg );
// 参数arg需要为整数类型  设置一个字节有符号8位二进制，即有效数字位为 7位，范围为（十进制）：-128 ~ 127 
// 1000 0000 即-0 被强制认为 -128

dav.setUint8( arg )  
// 参数arg需要为整数类型  设置一个字节无符号8位二进制，即有效数字位为 8位，范围为（十进制）：0 ~ 255

``依此类推
dav.setInt16( arg )
dav.setUint16( arg )

dav.setInt32( arg )
dav.setUint32( arg )

dav.setFloat32( arg )   //参数arg需要为浮点类型
dav.setFloat64( arg )
```
可以看到在设置二进制值的时候，可以设置有符号位与无符号位俩种。那这俩种分别有什么区别呢？

实例说明：
```javascript
// 实例化一个存储 10 个字节的缓冲，默认填充的为0，即 0000 0000 0000 ......。
let arrBuf = new ArrayBuffer(10); 

// 实例化一个 arrBuf 视图
let dav = new DataView(arrBuf);

// 存储一个十进制-20。-20被转化为二进制 1110 1100 存储到 arrBuf 第一个字节(8位)中。
dav.setInt8(0,-20);

// 获取 arrBuf 第一个字节中存储的8位数据，并且转化为 十进制 输出。
dav.getInt8(0);                   

// 获取 arrBuf 第一个字节中存储的8位数据，并且转化为 十进制 输出
dav.getUint8(0);

// 存储一个十进制-20。-20被转化为二进制 1110 1100 存储到 arrBuf 第一个字节(8位)中。
dav.setUint8(0,-20);

// 获取 arrBuf 第一个字节中存储的8位数据，并且转化为 十进制 输出。
dav.getInt8(0);

// 获取 arrBuf 第一个字节中存储的8位数据，并且转化为 十进制 输出  
dav.getUint8(0);
```

与上面相似的例子，只是设置值时使用了 setInt8(0,-20)、setUint8(0,-20) ，这里个区别在于设置的值是否是一个有符号位的二进制数据。

那么这里四个 getXXX 获取得函数分别输出什么呢？

答案是：**-20、236、-20、236。**

奇怪的地方就在于不论你设置的方法使用 setInt8(0,-20) 还是 setUint8(0,-20)，使用 getUint8(0) 获取的值都是 236，getInt8(0) 获取的值都是 -20。
> 测试浏览器：chrome、ff。
> 
> 测试的版本：67.0.3396.99（正式版本）、61.0.1 (64 位)

**目前暂未找到出现这个现象的原因以及理由，后续找到在更新！**

## 三. Blob相关知识

Blob 一个在 H5 FileReader 普及后逐渐浮现在开发者眼前的 **类文件对象**。

前面说的 ArrayBuffer 是一个存储原始二进制类型化数组，现在说的 Blob 也是用来存储二进制数据的，只不过 Blob 对象封装了很多操作，配合 FileReader、URL.createobjecturl 可以对原始数据进行各种转化。

比如：请求HTTP图片使用 URL.createobjecturl 生成 Blob Url，进行展示以及a 标签下载。

### 1. Blob 初始化

Blob 是一个对象，固然实例化通过 new 操作：
```javascript
let blob = new Blob([ ArrayBuffer, ArrayBufferView, Blob, DOMString ],{type: value });
```

new Blob 操作需要传入俩个参数。

第一个参数是一个数组，其值可以是 **ArrayBuffer, ArrayBufferView, Blob, DOMString**，看到参数就知道 Blob 可以对 ajax 获得的 ArrayBuffer 流进行转化，将原始二进制流封装成 JavaScript Blob 对象，从而配合其他 API 进行下一步操作。

第二个参数是一个对象，value 为 MIME 类型，默认值为空字符串。这个 MIME 类型是标识作用，即使一个图片的 ArrayBuffer 转化为 Blob 时 type 写为 application/json 也不影响后续操作。
> MIME完整手册连接：[MIME手册](http://www.w3school.com.cn/media/media_mimeref.asp)

### 2. Blob API

Blob对象本身的API并不多，俩个可读属性，一个方法。

**属性：**

1.  blob.size 返回 Blob 资源字节大小。 
2.  blob.type 返回 Blob 资源 MIME 类型。

**方法：**

1.  blob.slice(start, end, contentType) 返回一个新 Blob 资源 end,contentType 可选。

### 3. Blob 相关

Blob作为 JavaScript 中对原始二进制数据封装的对象自然少不了更多的转化操作，不然这个对象在已有 ArrayBuffer 存在后还有什么价值呢？

先来说说这段再熟悉不过的代码：

```html
<input id='file' type='file'>
```
```javascript
let file = document.getElementById('file').files[0];
```

这是一个典型的上传文件并且获取上传文件的 file 对象。

在选择完文件后可以通过 inputTag.files 获得 FileList 数组，而FileList 数组中全部都是 file 对象，这里的 file 对象就是特殊的Blob 的类型。

在所有可以对 Blob 进行转化的 API 中，file 对象都可以使用，上面说到的 URL.createobjecturl 以及 FileReader。

典型的应用就是**上传图片不通过后台直接展示。**
```javascript
let img = new Image();

let fileBlob = document.getElementById('file').files[0]; 

img.src = window.URL.createObjectURL(fileBlob);

document.body.appendChild(img);
```

**文章第二部分：**
> [Blob, FileReader, responseType, btoa,atob解码, 文件操作转化,知识点梳理（二）](http://www.ismoon.cn/article_detail?id=18)