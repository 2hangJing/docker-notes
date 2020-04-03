<!--
 * @Author: monai
 * @Date: 2020-02-27 14:42:53
 * @LastEditors: monai
 * @LastEditTime: 2020-04-03 18:12:36
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

**5. mysql**

**下载：** `apt-get -y install mysql-server mysql-client`

启动mysql：  
方式一：`/etc/init.d/mysql start`   
方式二：`service mysql start`

停止mysql：  
方式一：`/etc/init.d/mysql stop`  
方式二：`service mysql stop`  

重启mysql：  
方式一：`/etc/init.d/mysql restart` 
方式二：`service mysql restart`  

**部分指令：**  
1. `mysql -u root -p;` 进入mysql，root 账户
2. `show tables;` 查看表
3. `use databaseName;` 进入名为 databaseName 的数据库
4. `CREATE DATABASE 数据库名;` 创建数据库
5. `source /code/xxx.sql;` 导入/code/xxx.sql 文件
6. `show databases;` 查看数据库
7. `use mysql; select user,host,authentication_string from user;` 查看 mysql 所有用户表

**删除 ubuntu mysql**
1. `apt-get remove mysql-common`
2. `apt-get autoremove --purge mysql-server-5.0`
3. `dpkg -l |grep ^rc|awk '{print $2}' | xargs dpkg -P`
4. 
**查看默认账号密码：`cat /etc/mysql/debian.cnf`**

**博客环境切换注意：**  
1. `set password for "root"@localhost=password("123456");` 第一步设置 root 密码。
2. `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';` 第二步切换链接 mysql 验证方式
3. `update user set host = '%' where user = 'root';` 第三步将 root IP访问限制关闭，% 为全部IP均可以访问。
4. `CREATE DATABASE zj_web;` 第四步创建数据库
5. `source /code/xxx.sql;` 第五步导入/code/xxx.sql 文件