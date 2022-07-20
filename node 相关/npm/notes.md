<!--
 * @Author: monai
 * @Date: 2020-04-05 18:28:13
 * @LastEditors: monai
 * @LastEditTime: 2022-07-20 10:41:02
 -->
**1. --unsafe-perm 参数**  
npm 出于安全考虑不支持以 root 用户运行，即使以 root 用户身份运行，npm 会自动转成一个叫 nobody 的用户来运行，而这个用户几乎没有任何权限，加上 --unsafe-perm 参数，就不会切换到 nobody。

**设置淘宝源**
`npm config set registry=https://registry.npm.taobao.org`