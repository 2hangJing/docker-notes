<!--
 * @Author: monai
 * @Date: 2020-12-21 10:40:22
 * @LastEditors: monai
 * @LastEditTime: 2021-05-17 13:55:36
-->
# 一、npm 包升级
1. cnpm install vue@next --save-dev     //最新稳定版
2. cnpm install vuex@next --save-dev 
3. cnpm install vue-router@4 --save-dev
4. cnpm install vue-loader@next --save-dev
5. webpack4 sass-loader 不支持 11.x（11.x 需要 webpack5 支持），package.json=> "sass-loader": "^10", 解决问题。
响应式原理
https://zhuanlan.zhihu.com/p/146097763