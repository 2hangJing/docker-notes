<!--
 * @Author: monai
 * @Date: 2020-02-27 14:42:53
 * @LastEditors: monai
 * @LastEditTime: 2020-03-03 17:16:12
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

**2. node**