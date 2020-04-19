
前俩天在知乎上看了一篇详解 `vertical-align` 的文章，看完之后确实发现很多东西是平时没有注意到的，而且平时开发中有时使用 `vertical-align` 也会遇到一些奇怪的问题。

其实原因就是没有对这个简单的 `css` 属性理解透彻，使用过程中模棱两可。

现在记录一下看完知乎的文章之后自己的复现与理解。
> 知乎链接：[你可能不知道的vertical-align](https://zhuanlan.zhihu.com/p/52441893)

## 一、baseline的位置确定

要想彻底理解 `vertical-align` 就必须对 **baseline 的位置确定** 这个加粗字解透彻，不是说 baseline 本身有什么难的东西而是它在 `block、inline-block` 元素中它的**位置确定被很多博文、开发者忽略**，从而造成了即使你知道 `vertical-align` 各种属性与规则但是依旧不能解答出一些问题的原因。

为了确切了解这个东西翻了很多博客，比较郁闷的是基本都没有提及 **baseline 的位置确定** 这个问题，不过配合我自己尝试的 demo 与部分博文中写的知识总结了一些比较靠谱的规则，这也是我写这篇文章的原因之一。

### 1、baseline 本身规则

baseline 本身一张图可以说的很明白:

![](https://www.ismoon.cn/static/952d87adf3a5e5503cb3adbed378e389.jpg)

### 2、baseline 在 block、inline-block 中的位置确定

其实 baseline 位置确定规则我也没有找到一个比较权威的文档记录，只是配合 demo 与部分网上博文自己总结了一些规则。

不过虽然没有权威性但是在浏览器中实打实的实现该有的功能确实没问题。

先总结一下规则：
> ① 在一个父元素中，**baseline 的位置与子元素先后顺序无关，** 位置的确定只和 **某个子元素确定的最低 baselline 有关。**
> 
> ② 在一行中 `inline-block` 元素其 `overflow` 属性非默认值 `visible` ，**那么这一行其它元素根据设置了 `overflow` 属性的元素 `margin-box` 底边对齐**，不在与其内部元素确定的 baseline 对齐。如果一行中有多个元素设置了 `overflow` 属性，那么参照 ①，最低的元素确定这一行对齐的“基线”。**并且设置了 `overflow` 属性的元素内部不受影响，俩者不在是同一个 baseline 。**

**demo_1如下：**

code:
```html
<div>
    <div></div>
    <div></div>
    <span>xX</span>
    <span>xxXX</span>
</div>
```
```css
.parent0{
    display: inline-block;
    height: 400px;
    width: 400px;
    background-color: thistle;
}
.bock0{
    display: inline-block;
    height: 100px;
    width: 100px;
    background: cadetblue;
}
.bock1{
    display: inline-block;
    height: 200px;
    width: 100px;
    background: rgb(242, 254, 173);
}
```
img:

![](https://www.ismoon.cn/static/f0a0983e2b72322a08fe3304f9a9993a.png)

图中可以看到 **'粉色 `div`' 的 baseline 在 '黄色 `div`' `margin-box` 下边（`margin`为0），与子元素顺序无关。**

**demo_2如下：**

现在给 '黄色 `div`' 添加一个 `CSS` 属性： `vertical-align: middle;`

`vertical-align: middle;` 的意思是：让设置这个属性的元素中心点垂直对齐父元素 `（ baseline + x-height ） /2`。

img:

![](https://www.ismoon.cn/static/85e8c1a8a3e087150b7191c05f614de5.png)

图中暴露了这次主要写的问题所在：**baseline 的位置确定**，在给 “黄色 `div`” 设置 `vertical-align: middle;` 后，父元素的 `basline` 位置到底在哪里？

答案就是：**“黄色 div”的中心部分。**

为什么在黄色中心呢？

原因就是 **（ baseline + x-height ） /2** 的高度**大于 **'青色 div'的高度，细心点可以发现****'青色 `div`' 上面有一个缝，`inline-block` 的元素默认的 `vertical-align` 是 baseline。

这也就导致了这条缝隙的存在，因为它和 baseline 对齐。

从上面俩个 demo 可以看出来，**一个元素中它的 baseline 的位置是由某一个最低 baseline 的子元素来确定的！**

**demo_3如下：**

![](https://www.ismoon.cn/static/ba60b08edc6cb30fad409ff8c3f1c718.png)

复制了两份“粉色 `div`”，并且第三个“粉色`div`”设置了 `overflow： auto;`

从图中可以明显看到：

**① 其它俩个“粉色 `div`” baseline，与第三个“粉色 `div`”底部对齐**

**② 第三个“粉色 `div`”内部子元素不受影响**

## 二、vertical-align 属性

上面说了 baseline 与 一个元素中 baseline 是如何确定的，现在来回归的问题本身，`vertical-align`。
| 值              | 描述                                        |
|----------------|-------------------------------------------|
| baseline       | 默认。元素放置在父元素的基线上。             |
| sub            | 垂直对齐文本的下标。|
| super         | 垂直对齐文本的上标       |
| top        | 把元素的顶端与行中最高元素的顶端对齐|
| text\-top      | 把元素的顶端与父元素字体的顶端对齐|
| middle         | 把此元素放置在父元素的中部|
| bottom         | 把元素的顶端与行中最低的元素的顶端对齐 |
| text\-bottom   | 把元素的底端与父元素字体的底端对齐|
| length         |                         |
| %              | 使用 'line\-height' 属性的百分比值来排列此元素。允许使用负值。|
| inherit       | 规定应该从父元素继承 vertical\-align 属性的值。|

以上属性来自 w3c 。

**1、baseline**
这个无须多说，默认属性，将元素的 baseline 对齐 父元素的 baseline。

唯一要提的就是 `inline-bock` 元素，它的默认 baseline 是在 `margin-box` 底边。

如图所示：

![](https://www.ismoon.cn/static/094f207b9e8ecc100926d74ea4351f58.png)

**3、sub**

将元素底部与文本元素的下标底部对齐。

```html
<div>
    <div></div>
    <div></div>
    <span>xxXX<sub>xX</sub></span>
</div>
```
```css
.parent1 .bock1{
    display: inline-block;
    height: 50px;
    width: 50px;
    background: rgb(242, 254, 173);
    vertical-align: sub;
}
```

![](https://www.ismoon.cn/static/ece2a3477f6fae686b6208be25f32dca.png)

**4、super**

与 sub 相反，不做赘述。

![](https://www.ismoon.cn/static/b235e07fcc753ea94d8ae3006b16c143.png)

### 

**5、top**

把元素的顶端与行中最高元素的顶端对齐 ，顾名思义，直接看图吧：

![](https://www.ismoon.cn/static/346f5d185f9da89a18ab4126bef64d77.png)

**6、text-top**

把元素的顶端与父元素字体的顶端对齐

![](https://www.ismoon.cn/static/9d9ab3b5e5dab7e2c6bd16718ec57b1b.png)

**7、middle**

把此元素放置在父元素的中部。

这是 `vertical-align` 一个坑的地方了，放置位置也不是一句简单的 **父元素中部 **，具体位置是 **（父元素baseline + x-height）/2**

baseline 的位置前面说过了，那么 `x-height` 是什么？　

其实就是顾名思义 **x 字母一半的高度，也就是 x-height**。从此可见相当之坑，因为 `x-height` 与 x 的 `font-size` 是关联的，`font-size` 越大，`x-height` 越大......

![](https://www.ismoon.cn/static/3e522ffae000ca3cde774e0cd0214e0a.png)

图中红色为 baseline ，蓝色的就是 `middle` 对齐的中线也就是 **（父元素baseline + x-height）/2**。（我用PS 量过了，千真万确!!!）

**8、bottom**

把元素的顶端与行中最低的元素的顶端对齐，与 **5、top** 相反。

![](https://www.ismoon.cn/static/ca62112fe9ec286d47a1e473b252bf72.png)

**9、text-bottom**

把元素的底端与父元素字体的底端对齐。

![](https://www.ismoon.cn/static/ca62112fe9ec286d47a1e473b252bf72.png)

这里与 **8、bottom** 相似，因为这个 demo 中，最低元素 == 元素字体底端

**10、length**

将设置属性的元素 baseline 与父元素 baseline 经行Y 轴位移。正数往上，反之向下。

这里将 小黄块 设置CSS属性 `vertical-align: -50px`，效果如下：

![](https://www.ismoon.cn/static/050d7843235394b3432b1affebede06b.png)

**11、%**

使用 `line-height` 属性的百分比值来排列此元素。允许使用负值。

其实就是用父元素的 **line-height * x%** 来经行Y轴移动，正数往上，反之向下。

![](https://www.ismoon.cn/static/a4cffbe5eaeb959177465c2ea14bc763.png)

父元素： `line-height: 100px;`

小黄块： `vertical-align: -50%;`

二者相乘也就是 -50px; 与 **10、length** 中例子相同效果。

## 三、一些常见的 vertical-align 的问题

前面详细记录了 `vertical-align` 所有属性值以及相当关键的 `vertical-align` 位置的确定，那么现在就来实际中解决一定的问题。

### 1、图片底部间隙

img:

![](https://www.ismoon.cn/static/50d28d80ef87dfbcb837de5a65a3fa20.png)

code:
```css
div{ width: 300px; background: thistle;}
```
```html
<div>
    <img src alt>
</div>
```

从图中观察到图片底部出现了一个间隙，那么这个间隙出现的原因是什么呢？

其实这个间隙可以根据 `.parent0` 的 `font-size` 设置而变动的，设置的越大间隙的距离越大。

根据在在一些博文中找到的原因，这个间隙是给英文中在 baseline 下面的笔画预留的间隙，比如“g、p”这俩个英文底下部分在 baseline 下面。

那么解决办法也很简单，给图片一个 `vertical-align: bottom;` 让父元素的 baseline 对齐到图片的底部。

### 2、middle 没有垂直居中问题

img:

![](https://www.ismoon.cn/static/84a506991f227460995ff2f5856e7922.png)

code:
```css
div{ 
    width: 300px; 
    height: 200px; 
    background: thistle;
}
.parent0 img{ 
    height: 190px; 
    vertical-align: middle;
}
```
```html
<div>
    <img src alt>
</div>
```

这个居中问题前面也提到了，它对齐的是 **（父元素baseline + x-height）/2** ，所以没有对齐也没有多奇怪，那么如何让它垂直居中呢？

只需要让父元素的 baseline 挪到合适的地方就好了。

通过增加一个和父元素高度相同的元素并且设置 `vertical-align: middle;` 来让它把 baseline 的位置设置到恰好的位置。

img:

![](https://www.ismoon.cn/static/69b6871daf31bfe43bb7ca441140d4da.png)

code:
```css
.parent3:after{
    content: '';
    display: inline-block;
    height: 100%;
    width: 1px;
    background: salmon;
    vertical-align: middle;
}
```

通过伪元素巧妙地将 basline 设置到恰好的位置上，这样图片进行 `vertical-align: middle;` 时就是正好居中的。

### 3、一行 inline-block 元素对不齐问题

img:

![](https://www.ismoon.cn/static/f02b157f00426ef943a7b6bfc48dbeda.png)

code:
```html
<div></div>
<div> x </div>
<div></div>
<div> x </div>
<div> x </div>
<div></div>
```
```css
div{
    height: 100px;
    width: 100px;
    display: inline-block;
}
```
在一行 `inline-block` 元素中，因为子元素出现文本导致 baseline 被设定到文本的底部，从而出现上下错位问题。

解决办法也很简单，第四个 div 中设置了 `overflow: auto;` 从而解决了问题，这个问题也体现了前面总结的 baseline 的对齐规则第二条。

## 四、结尾

这次的文章写作源头就是看了那片知乎文章，在自己研究过程中发现，这个 `vertical-align` 远比想的复杂的多，涉及到很多东西。

通过查找 mdn、w3c、个人博客 总算是比较完善的学了 `vertical-align` 这个CSS属性。

CSS 这个东西没有什么难的，但是就是杂、乱，很多东西你不去研究，不去彻底的理解，那么在你平时布局过程中就是模棱两可的。

写博客说实话挺累的，不仅要自己懂，还要想办法表述出来。不过这也是一种强化记忆，并且以后忘了还能看看自己的文章。

这几天的研究中还学习了 BFC、margin 重叠...等很多比较基础的布局概念，有空记录下来。

快过年啦！！2019年希望我还能像2018年一样保持前端的初心，在这个浮躁的行业里不要乘醉于各种框架、轮子，而应该对基础的研究更加透彻。

加油！！！

感谢下面俩篇博文的作者。
> [深入理解css中vertical-align属性](https://www.cnblogs.com/starof/p/4512284.html?utm_source=tuicool&amp;utm_medium=referral)
> 
> [CSS中vertical-align的默认值baseline的理解](https://www.cnblogs.com/xuhaodong/p/basseline.html)