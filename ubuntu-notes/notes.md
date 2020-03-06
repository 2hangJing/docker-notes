<!--
 * @Author: monai
 * @Date: 2020-02-27 14:42:53
 * @LastEditors: monai
 * @LastEditTime: 2020-03-06 16:00:37
 -->
# ubuntu 笔记
在学docker中 linux 部分指令以及部分软件安装、文件拷贝等操作记录

## 指令 ##

**1. apt-get**  
软件安装指令 <https://b9532026.wordpress.com/category/linux/>  

**1. ps -ef|grep xxx**  
查询一个软件的进程

## 软件 ##
**1. nginx**  

下载：apt-get -y install nginx  
配置文件目录：/etc/nginx/nginx.conf  
启动：service nginx start  
关闭：service nginx stop  
重启：service nginx restart  
重启：service nginx reload *不重启重新载入最新配置文件内容*

**2. nvm**

下载：curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash  
下载完成后配置环境变量  
export NVM_DIR="$HOME/.nvm" \  
&& [ -s "$NVM_DIR/nvm.sh" ] \  
&& \. "$NVM_DIR/nvm.sh" \  
&& [ -s "$NVM_DIR/bash_completion" ] \  
&& \. "$NVM_DIR/bash_completion"  

node 下载指令：
nvm install vx.x.x 示例： nvm install v10.16.0

**2. curl**  
下载：apt-get -y install curl

**4. node**

    下一代 Debian 正式发行版的代号为 "bullseye" — 发布时间尚未确定
    Debian 10（"buster"） — 当前的稳定版（stable）
    Debian 9（"stretch"） — 旧的稳定版（oldstable）
    Debian 8（"jessie"） — 更旧的稳定版（oldoldstable）
    Debian 7（"wheezy"） — 被淘汰的稳定版
    Debian 6.0（"squeeze"） — 被淘汰的稳定版
    Debian GNU/Linux 5.0（"lenny"） — 被淘汰的稳定版
    Debian GNU/Linux 4.0（"etch"） — 被淘汰的稳定版
    Debian GNU/Linux 3.1（"sarge"） — 被淘汰的稳定版
    Debian GNU/Linux 3.0（"woody"） — 被淘汰的稳定版
    Debian GNU/Linux 2.2（"potato"） — 被淘汰的稳定版
    Debian GNU/Linux 2.1（"slink"） — 被淘汰的稳定版
    Debian GNU/Linux 2.0（"hamm"） — 被淘汰的稳定版
