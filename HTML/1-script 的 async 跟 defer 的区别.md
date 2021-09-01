<!--
 * @Author: monai
 * @Date: 2021-09-01 11:34:04
 * @LastEditors: monai
 * @LastEditTime: 2021-09-01 13:54:13
-->
## 作用
如图：
![alt 属性文本](./image/1-async与defer区别.png)

## 相同点：
 - 加载文件时不阻塞页面渲染
 - 对于inline的script（内联脚本）无效
 - 使用这两个属性的脚本中不能调用document.write方法
 - 有脚本的onload的事件回调

## 不同点：
 - html的版本html4.0中定义了defer；html5.0中定义了async
 - 浏览器兼容性
 - 每一个async属性的脚本都在它下载结束之后立刻执行，同时会在window的load事件之前执行。所以就有可能出现脚本执行顺序被打乱的情况；
 - 每一个defer属性的脚本都是在页面解析完毕之后，按照原本的顺序执行，同时会在document的DOMContentLoaded之前执行。


