<!--
 * @Author: monai
 * @Date: 2020-05-21 10:44:02
 * @LastEditors: monai
 * @LastEditTime: 2020-06-29 17:18:00
--> 

<!-- https://www.frontendwingman.com/Chrome/C03/object&function.html -->
# 配置问题

## chrome DevTools 

1. html + CSS 预览面板布局设置。
   - run command 或者 ctrl + shift + p，打开 chrome 的shell。
   - 输入 panel layout。
   - 三种（左右、上下、自动）选择一个，已设置的不显示。

2. console 相关
   - $ 是 document.querySelector 别名。
   - $$ 是 document.QuerySelectorAll 别名，并且返回的是数组而不是 Node list。
   - $_ 是 上次输出的引用。

## chrome 中不显示复杂跨域的 options 请求

解决方法：
1. 打开 chrome://flags/#out-of-blink-cors。
2. Out of blink CORS 设置为 Disabled。
3. 重启。