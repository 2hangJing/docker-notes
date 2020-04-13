CSS 层叠样式表，英文全称 Cascading Style Sheets，既然名字是层叠样式表那么自然少不了层叠方面的规则、知识。

在开发我这个 vue ssr 个人博客时首页的一个特效相互冲突，元素层叠的顺序总是不能按照我的逻辑来，遂查了查相关问题以及资料，当时知道了原来除了 `float` `position` 等之外还有很多层叠规则、层叠顺序。

最近公司项目调整期有点空闲时间便想起这个问题，现在记录下学习流程，梳理下整体思路。

## 一. CSS层叠上下文

上下文，这个和 JavaScript 上下文有异曲同工之处，想必 JavaScript 的上下文再清楚不过了，是不是这么一说突然有了一些抽象的印象了呢？

CSS既然有了层叠顺序比如 `z-index` ，那么肯定就会有这个 `z-index` 可以适用的范围，就拿 `z-index` 来说：

**（以下所有代码有部分精简，只突出作用部分）**

```css
/* 注意这里的z-index: 0 */
.div1{ position: relative; z-index: 0; }
.div2{ position: absolute; z-index: 5; }
.div3{ position: absolut; z-index: 0; }
```
```html
<div class='div1'>
    <div class='div2'></div>
</div>
<div class='div3'></div>
```

代码中的 **div1、2、3** 三者的层叠顺序是怎样的呢？看图：

![](https://www.ismoon.cn/static/156c031e9ff69a243a08140d6bd9b731.png)

上述代码中 `.div2` 的 `z-index` 适用范围是在 `.div1` 内。这里 `.div1` 便是一个层叠上下文（确切的原因是 `z-index:0` ）。  
代码中有一行注释：注意 `z-index: 0;` 如果不设置这里默认是 `z-inde: auto;` ，那么俩者有什么区别呢？继续拿 `z-index`说事：
```css
.div1{ position: relative;} 
/* 注意这里的z-index 并没有设置为0 */
.div2{ position: absolute; z-index: 5; }
.div3{ position: absolut; z-index: 0; }
```
```html
<div class='div1'>
    <div class='div2'></div>
</div>
<div class='div3'></div>
```
一点点小改动，那么现在**div1、2、3** 三者的层叠顺序是怎样的呢？看图：

![](https://www.ismoon.cn/static/6630c5f72043cf98fe7cc77c77942801.png)

!!!很神奇有木有.....

那么出现 div2 遮住 div3 的原因是什么呢？就是现在说的**CSS层叠上下文。**

### 1. 层叠上下文定义、概念

首先根据 MDN 给出的定义：
> 层叠上下文是 HTML 元素的三维概念，这些HTML元素在一条假想的相对于面向（电脑屏幕的）视窗或者网页的用户的z轴上延伸，HTML 元素依据其自身属性按照优先级顺序占用层叠上下文的空间。

这里用直白的话总结融合刚才实例与定义就是：

1.  在**同一个**层叠上下文中，根据层叠顺序依次排列，当然这个排列是Z轴的。
2.  在**不同的**层叠上下文中，创建层叠上下文的元素在相对应的层叠上下文中层级越高，它所包含的元素基础层级越高。

第二个有点绕口，就拿刚才那个小测试来说明：

根元素 HTML 是最基本的层叠上下文元素，也就是说在都不创建层叠上下文的前提下，直接按照元素的层叠顺序比较，都是相对HTML这个最大的层叠上下文元素的。

在删除掉 `z-inde: 0;` 这个 CSS 属性后 div1 就不再创建一个层叠上下文，那么它内部的 div2 便是根据 HTML 进行层级排列。

div1、2、3 的 `z-index` 值分别为：`auto(相当于0) 5 0`。再根据文档流先后渲染顺序：

1.  div2在上层
2.  div3在中间
3.  div1在底部

显而易见，这个结论符合刚才实例的结果。

### 2. 如何创建一个层叠上下文

由于 CSS3 中增加了很多属性，这里根据W3C中查到的全部可以创建一个层叠上下文的属性：
> 根元素 (HTML)  
> z-index 值不为 'auto'的绝对/相对定位，  
> 一个 z-index 值不为 'auto'的flex 项目 (flex item)，即：父元素 display: flex|inline-flex，  
> opacity 属性值小于 1 的元素，  
> transform 属性值不为 'none'的元素，  
> mix-blend-mode 属性值不为 'normal'的元素，  
> filter 值不为“none”的元素，  
> perspective 值不为“none”的元素，  
> isolation 属性被设置为 'isolate'的元素，  
> position: fixed  
> 在 will-change 中指定了任意 CSS属性  
> -webkit-overflow-scrolling 属性被设置 'touch'的元素  

由上面列举出来的属性可以配合最开始的实例说明了 `z-index` 在设置为 `auto`（不创建层叠上下文）和设置为 0（创建一个层叠上下文）导致的 div1、2、3 层叠显示的区别。

### 3. 层叠上下文的层级

前面说了如何创建一个层叠上下文以及什么是层叠上下文，那么创建层叠上下文的元素它本身的层级是怎样的呢？

代码实例：
```css
.div1{ position: absolut; z-index: 0; } 
.div3{ opacity: 0.6 }
```
```html
<div class='div1'></div>
<div class='div3'></div>
```
![](https://www.ismoon.cn/static/d495d58bd39fed0d64cfe86d577dd56d.png)

图中可以显示出，创建了层叠上下文的元素**层级与 z-index:0 || auto; 相同**，因为通过修改 div1 的层级可以很明显看出

1.  当div1 `z-index >0` 时，它就会遮挡住div1，即使 div3 是排列在 div1 之后。
2.  当div1 `z-index <=0` 时，按照文档流先后渲顺序 div3 遮挡住 div1。

其实不只是通过 `opacity` 来创建一个层叠上下文，通过 `transform` 属性等，其他属性创建的层叠上下文元素层级也同样是与有 `z-index:0;` 的属性的元素相同。

## 二. CSS层叠顺序

既然元素渲染时有层叠问题，那么必然要分出个三六九等谁在上谁在下，也就是CSS层叠顺序。

最常见的莫不过 绝对定位、相对定位、z-index，不过这只是冰山一脚，全部的堆叠顺序如下：

### 1. W3C堆叠顺序

层叠顺序在W3C中给了七层：

> the background and borders of the element forming the stacking context.
> 
> the child stacking contexts with negative stack levels (most  negative first).
> 
> the in-flow, non-inline-level, non-positioned descendants.
> 
> the non-positioned floats.
> 
> the in-flow, inline-level, non-positioned descendants, including  inline tables and inline blocks.
> 
> the child stacking contexts with stack level 0 and the  positioned descendants with stack level 0.
> 
> the child stacking contexts with positive stack levels (least  positive first).

翻译过来就是：

1. 创建堆叠上下文元素的背景和边界，`background`、`border`。
2. 子堆叠具有负堆栈级别的上下文。`z-index<0` (在 `z-index` 有效时，它本身已经创造了一个堆叠上下文，也就是子堆叠，比如：元素有 `position:absolute` 属性)
3.  在一个流内的元素中，非内联，非定位的后代元素。`disply: block;` ( 这个in-flow 其实就是一个DOM集合，指代一段HTML代码，但是里面的元素必须是normal flow 普通文档流的元素 )
4.  非定位的浮动元素。`float: left || right`
5.  在一个流内的元素中，内联，非定位的后代元素，包括行内、行内块。`disply: inline ||inline-block`
6.  堆栈级别为0的子堆栈上下文和堆栈级别为0的已定位后代。 `z-index:0 || auto`
7.  子堆栈上下文具有正堆栈级别（最少大于等于1）。 `z-index>=1`

用一张图来表示:

![](https://www.ismoon.cn/static/8392ef3e837b734eee885a7b7e73cd7f.png)

### 2. 实例证明

首先验证一下 **创建堆叠上下文元素的background<内部z-index<0的元素<block块状元素**
```css
.div0{ position: relative; z-index: 1; }
/* 最外层创建堆叠上下文的元素 */
.div1{ position: absolute; z-index: -5; }
/* z-index<0 的元素 */
.div2{ margin-top: 50px; }
/* block 块元素 */
```
```html
<div class='div0'>
    div0 
    <div class='div1'>div1</div>
    <div class='div2'>div2</div>
</div>
```


结果如图所示：

![](https://www.ismoon.cn/static/f30d866f99e7a964eb9c50b15982d756.png)

完全符合层叠顺序所规定。

再来验证一下 **float元素< 内联元素< z-index:0元素< z-index>0元素**
```css
.div0{ position: relative; z-index: 1; }
/* 创建堆叠上下文 */
.div1{ float: left; }
/* 浮动元素 */
.div2{ display: inline-block; }
/* 内联元素 */
.div3{ position: absolute; z-index: 0; }
/* z-index:0 元素 */
.div4{ position: absolute; z-index: 5; }
/* z-index>0 元素 */
```
```html
<div class='div0'> 
    div0 
    <div class='div1'> div1 </div>        
    <div class='div2'> div2 </div>    
    <div class='div3'> div3 </div>    
    <div class='div4'> div4 </div>
</div>
```

结果如图所示：

![](https://www.ismoon.cn/static/86eb21185c20bb3dff18c77ea776d3c7.png)

也是和规范所以顺序相同。

## 三. 总结

在不知道层叠上下文这个概念时，遇到这种层叠问题真的是无从下手，而且总是觉得因为其他未知原因导致怪异的层叠行为。特别是不知道像 `transform`、`opacity` 这种也会激发一个元素创建一个层叠上下文时更加莫名其妙。

经过这次对 CSS 层叠部分的学习突然发现前端现在对 JavaScript 重视程度让 CSS、HTML 这样看似简单其实奥妙无穷的东西显得有些冷落。

最近还看了 `transform3d` 部分知识，对GPU加速等性能优化有一些总结，有空写一篇3d变换部分的知识梳理。