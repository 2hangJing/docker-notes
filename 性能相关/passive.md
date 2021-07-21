<!--
 * @Author: monai
 * @Date: 2021-07-21 15:43:39
 * @LastEditors: monai
 * @LastEditTime: 2021-07-21 15:53:10
-->
# passive 
1. scroll/touch 事件通过绑定 addEventListener('scroll', fn, {passive: true}) 时第三个参数明确说明不会调用 preventDefault()，从而浏览器不必在 fn 执行完毕后才知道是否调用了 preventDefault() 从而在 fn 执行期间就可以让屏幕保持跟手的滚动。
    1. chrome 文档 https://www.chromestatus.com/feature/5745543795965952
    2. demo https://rbyers.github.io/scroll-latency.html

