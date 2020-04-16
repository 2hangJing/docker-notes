<!--
 * @Author: monai
 * @Date: 2020-04-16 18:48:44
 * @LastEditors: monai
 * @LastEditTime: 2020-04-16 22:20:29
 -->
从接触前端开发到现在这个多行省溢出省略号问题就一直如影随形，就职的公司都遇到过这个问题。

虽然问题摆在这里但是这么一个很实用、很简单的功能至今 `css` 没有一个标准来处理这个它，`-webkit-` 到是有但是兼容问题无解，还是没有根本解决问题。

遇到 UI 好说话的让她设计时两行文字变一行，`css` 无兼容问题直接处理，心里美滋滋。

![](https://www.ismoon.cn/static/433012d6ee3fab2a6acfeb58078f5b31.jpg)

遇到不好说话的就只能拿出我常用的三种方法来处理了。

![](https://www.ismoon.cn/static/ee2e7e5bf423d2e5d14b3a84bec76cd7.jpg)

## 一、javascript 处理方式

既然用到了 `js` 那么处理的情况的兼容性以及处理完的样式都比较好，如下图所示：

![](https://www.ismoon.cn/static/645e54ff5865bc8c42319b1a1d69482c.jpg)

可以看到基本常用的文字、字母、特殊符号等基本都可以完美兼容。
`js` 实现原理也很简单获取行高与设置的最大行数，通过整个文本区域得高度是否大于行高×最大高度来判断是否截断尾部得字符。当高度正好时替换尾部得字符为 '......' 。

下面贴出代码：
```javascript
let domArr = Array.from(document.querySelectorAll('p'));

function overflowHidden(domArr, maxLine, isCall) {

    let domArrFilter = [];

    domArrFilter = domArr.filter((item, index)=>{

        let text = item.innerText;

        let isFilter = false;

        //  段落高度
        let itemHei = parseInt(item.clientHeight);

        //  最大行数 * 行高，获取展示最大行数时需要的高度
        //  注意：此处需要设置标签行高，如果没设置返回值为 normal !
        let maxHei =  parseInt(getComputedStyle(item).lineHeight) * maxLine;

        //  通过高度递归截取最后一个字符
        if (itemHei > maxHei) {

            //  裁剪时有可能为上次自调用已经将尾部替换为 ..... 的文本
            //  增加 ..... 之后又出现还行
            if(text.slice(-5) == '.....'){

                item.innerText = text.slice(0, -6) + '.....';
            }else{

                item.innerText = text.slice(0, -1);
            }

            isFilter = true;

        //  自调用时通过 isCall 来判断出是否是自调用。
        //  三种情况：
        //  1. 选取的DOM中首次循环判断时： 文字区域高度 &lt;= 文字行高 * maxLine, 不需要增加 .....
        //  2. 自调用裁剪文字后最终 文字区域高度 == 文字行高 * maxLine，这种情况需要替换尾部 .....
        //  3. 自调用的文字在尾部替换 ..... 之后不再需要替换了
        } else if (isCall && text.slice(-5) != '.....') {

            //  为什么是 五个. 因为 ..... 正好与一个 汉字、两个字母（四个 i）、两个数字宽度相同，
            //  在文本标签中设置  text-align: justify;  可以很好的对齐两端。
            item.innerText = text.slice(0, -1) + '.....';

            //  为什么是裁剪之后还要循环一次？
            //  当尾部是两个 字母、数字时，只裁剪一位不够五个. 的宽度
            //  为什么不判断时不时裁剪的是 字母、数字 从而剪掉两位？
            //  还有一些特殊符号、字符、全角空格等问题，直接统一处理再次判断替换尾部 ..... 之后是否符合要求。
            isFilter = true;
        }

        return isFilter;
    });

    if (domArrFilter.length > 0) {

        overflowHidden(domArrFilter, maxLine, true);
    }
}

overflowHidden(domArr, 2, false);
```
因为实际项目中这种多行超出省略号一般都是在一个文本 List 区域，所以此 `js` 实现需要通过传入 `DOM` 集合来做多个文本统一处理。

## 二、无兼容问题的CSS处理方式

虽然 `js` 确实可以比较完美的处理这个问题，但是这么一点点的需求实现就要用 `js` 做 DOM 操作来处理明显有悖于平时开发的理念：快速、简单。那么使用 `CSS` 又不用考虑兼容问题的处理方法有吗？  
**当然有。**

首先说明这个方法不是我自己想出来的，是网上搜索这个问题时看到的。具体谁发明的已经不可考究了，因为各个IT网站都有转载而且原创也没有标明。

`CSS` 处理的方法是利用 `float` 实现的，所以这个 `CSS` 方法不存在兼容问题。实现的原理比较灵巧语言很难描述，下图说明。

1. 首先最开始需要用四个 `div` 做如下图所示布局

![](https://www.ismoon.cn/static/5d78f07973924f111292ec9ee3c382a6.jpg)

红色方块就是文本区域。
蓝色方块是宽度可以为 `1px` 的配合方块，高度与文本框高度持平，在图中就是与黑色文本框高度相同。
绿色是宽度小于等于蓝色宽度的配合方块。
黑色框子代表最大宽高的文本框，超出之后隐藏。

2. 当红色文本区域超出黑色文本框最大高度后就会出现如下图所示效果：

![](https://www.ismoon.cn/static/4ed09403507a1c8620da8d67c5993cc8.jpg)

这里就可以明显看到通过定位的右边的绿色小方块遮挡在黑色文本框尾部，这也就是整个 `css` 处理的原理，通过浮动与定位让 “.....” 恰好在文本区域超出文本框时定位在文本框尾部，从头到尾都是兼容性非常好的 `CSS` 属性，从而达到IE8以上全部通用。

在知道原理后可以将遮挡尾部的方块适当“润色”，添加渐变透明png，添加 ..... 来作为超出之后提示。
实际效果如下图：

![](https://www.ismoon.cn/static/cca96a44c66cb1d942ea19fd98de4135.jpg)

图中尾部显示效果只是随便调整了一下，整体效果也不错。代码就不贴了，原理知道了实现起来很简单。

## 三、总结

其实这只是一个很简单很常用的东西，但是现在 `CSS` 都没有去标准实现，只能要用这些奇技淫巧去曲线救国。最近接触的 `CSS` 问题都比较多，`CSS` 这个东西就是一个天坑，比 `js` 还坑。
坑也没办法，这是工作啊。