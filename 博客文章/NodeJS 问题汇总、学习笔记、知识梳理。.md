<!--
 * @Author: monai
 * @Date: 2020-05-11 11:43:33
 * @LastEditors: monai
 * @LastEditTime: 2020-05-11 11:48:58
 -->
## 一. express-session中 session加密、解密、校验流程

在了解相关 session 知识时接触到了加密解密，因此对加 session 加密解密比较好奇，遂查找社区，找到了不错的回答，在此记录方便后续复习、学习。
以下为校验流程：

> 原文链接：[https://cnodejs.org/topic/55c37de8b98f51142b367aba](https://cnodejs.org/topic/55c37de8b98f51142b367aba)

### 1. 若本次cookie中没有connect.sid，则生成一个  [用secret生成connect.sid]

1. 用 uid-safe 生成一个唯一 id，记为 sessionid，保证每次不重复；  

2. 把上面的 connect.sid 制作成 `'s:' + sessionid + '.' + sessionid.sha256(secret).base64()` 的形式，实现在 node-cookie-signature 的 sign 函数；

3. 把 sessionid 用 set-cookie 返回给前端；

### 2. 若本次cookie中包含connect.sid，则验证它是否是本服务器生成的  [用secret验证connect.sid]

1. 取出 cookie 中的 connect.sid，形式是上面的 `'s:' + sessionid + '.' + sessionid.sha256(secret).base64()`；

2. 从 connect.sid 中截取出 `sessionid=connect.sid.slice(2, connect.sid.indexOf(’.’))`；

3. 用取出的 sessionid 再算一次 `sessionid.sha256(secret).base64()` 记为 mac；

4. 截取 connect.sid 中 '.' 后的部分与 mac 对比；node-cookie-signature 的 unsign 函数（用上次计算的sha256 值和这次计算的 sha256 值进行比较，只要 secret 一样，结果就一样）；

5. 验证成功的 sessionid 继续往下走。

## 二.nginx反向代理后，express ip获取设置

今天做了blog 的留言系统，存取的是数据中含有IP，但是系统写完后测试的时候发现全是127.0.0.1，想了想出现这个原因可能是和 nginx 的反向代理有关，就开始差 nginx 的属性配置手册，查来查去发现确实没有配置：

`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`

1. X-Forwarded-For ：heard 中记录各级代理的 IP 列表，第一位是客户端 IP，这是 Http1.1 协议中规定的头部属性
2. $proxy_add_x_forwarded_for  ：nginx 中的变量，这个变量中保存的内容就是请求中的 X-Forwarded-For 信息 这个属性修改完毕后更新 nginx 配置、重启 nginx ，再次测试。

结果依旧是 127.0.0.1 

这时不再使用 req.ip 获取 ip ，而是使用 req.headers['x-forwarded-for'] ，发现可以获取到真实 ip。

这时问题的目光转向 express ，从4.x 手册中发现 Application Settings 中 trust proxy 属性与反向代理有关。

这个属性有一个简单的 true、false 值，分别代表：

1. true 客户端的IP地址作为 **X-Forwarded-** 头部的最左边的条目
2. false **app** 直接与英特网直连，客户端的IP地址衍生自 **req.connection.remoteAddress**    

搞了半天终于明白为什么在 nginx 设置了 X-Forwarded-For 后依旧无法获取真实ip，原因就是默认值 false 导致获取的 nginx ip。
```javascript
const express = require('express')();

/* 设置 trust proxy 为 true
--------------------------*/
server.enable('trust proxy');
```
> 参考：[菜鸟Express4.x 中文API](http://www.runoob.com/w3cnote/express-4-x-api.html#trust.proxy.options.table)、[Express4.x](http://www.expressjs.com.cn/guide/behind-proxies.html)、[nginx X-Forwarded-For 配置](https://www.cnblogs.com/lyongerr/articles/4994157.html)

编辑于： 2019/2/20

## 三.windows平台nvm 相关

五一在家准备写个小游戏，更新一下11版本的node。nvm 下载版本之后 npm 一直下载失败，看来又是共产主义的外套保护我们不受伤害导致的。

解决之道：

nvm 根目录打开 settings.txt ，添加镜像源

`node_mirror: https://npm.taobao.org/mirrors/node/` 

`npm_mirror: https://npm.taobao.org/mirrors/npm/`

每个 nvm 安装的 node 版本在没有设置 npm -g 安装目录的之前，默认安装在当前版本的 node 文件夹中，这就造成了每安装一个 node 版本就要给所有 npm -g 再重新安装一遍。通过以下配置修改全局安装目录 

`npm config set prefix 'D:odeJS_global_npm'`

设置之后所有的 npm -g 都回统一安装在 nodeJS_global_npm 目录。

修改安装目录之后需要修改全局环境变量，分别在用户、系统环境变量中添加：

用户变量中添加以下：

1. 变量名：PATH
2. 变量值：D:odeJS_global_npm

系统变量添加以下：
1. 变量名：NODE_PATH
2. 变量值：D:odeJS_global_npm
    

编辑于： 2019/5/1  