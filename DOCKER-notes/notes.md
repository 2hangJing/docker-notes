<!--
 * @Author: monai
 * @Date: 2020-02-27 14:42:53
 * @LastEditors: monai
 * @LastEditTime: 2023-05-13 21:36:15
 -->
# docker 笔记
准备将自己的博客系统装Ubuntu中，本地开发环境是win不太方便学习，docker正好解决这个问题，先学习下docker。

*参考*  
<https://yeasy.gitbooks.io/docker_practice/image/list.html>
<https://philipzheng.gitbooks.io/docker_practice/content/dockerfile/build_image.html>

*docker 指令*  
<https://joshhu.gitbooks.io/dockercommands/content/Containers/DockerRun.html>
<https://yeasy.gitbook.io/docker_practice/container/attach_exec>

## 其他 ##
.dockerignore  
<https://qhh.me/2019/02/24/dockerignore-%E6%96%87%E4%BB%B6%E4%BB%8E%E5%85%A5%E9%97%A8%E5%88%B0%E5%AE%9E%E8%B7%B5/>

## 常用指令
- 列举 container: docker container ls
- 进入 container: docker exec -it bash 

## image 镜像

**1. 获取镜像**  

*docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]*  

Docker 镜像仓库地址：地址的格式一般是 <域名/IP>[:端口号]。默认地址是 Docker Hub。  
仓库名：仓库名是两段式名称，即 <用户名>/<软件名>。对于 Docker Hub，如果不给出用户名，则默认为 library，也就是官方镜像

Docker Hub 官方镜像   
<https://hub.docker.com/search?q=&type=image>

示例：  
docker pull ubuntu:18.04  
docker pull [Docker Hub官方地址] library/ubuntu:18.04  

**2. 列出镜像**

*docker image ls [选项]*  
*docker image ls --help* 展示相关选项

pull 指令的是压缩镜像，Docker Hub 上显示的是镜像压缩体积，本地为解压后各层所占空间的总和。

docker的镜像是多层存储结构，可以复用、继承。不同的镜像可以使用相同的基础镜像，从而拥有共同的层，相同层只保存一份。所以镜像实际占用空间比列表中镜像大小总和要小。

*docker system df*  
查看镜像、容器、数据卷所占用的空间。

**3. 删除镜像**

*docker image rm [选项] <镜像1> [<镜像2> ...]*  
*docker image rm --help* 展示相关选项

删除本地镜像，可以使用镜像的短ID、长ID、镜像名、摘要。


## Dockerfile ##

Dockerfile 是一个文本文件，其内包含了一条条的指令(*Instruction*)，每一条指令构建一层，因此每一条指令的内容，就是描述该层应当如何构建。  
通过定义好的 *.Dockerfile* 文件生成定制镜像，可以方便的看到镜像安装有什么。后期维护与更改都方便。

**1.构建**  

*docker build [选项] 上下文路径/URL/*  

通过构建指令指定Dockerfile 定制image，常用选项如下， *docker build --help*  展示相关选项

* docker build -t nginx:v3 .，-t 代表定制镜像名称与tag
* docker build -f xxxx.Dockerfile .，-f 代表指定一个文件为 Dockerfile。
 
可以多个参数一起使用： docker build -t nginx:v3 -f xxxx.Dockerfile .

*上下文路径/URL/*  
指定一个目录为当前上下文路径，**.** 代表当前目录，在指令中就是表是当前目录指定为上下文路径。默认情况下，如果不额外指定 Dockerfile 的话，会将上下文目录下的名为 Dockerfile 的文件作为 Dockerfile。  
**注意：此处并不是指定 Dockerfile 文件的路径。**

**Ⅰ.FROM 指令**  

*FROM image[:tag]*  
FROM 指令指定基础镜像，参数可以是**image**或者**image:tag**两种格式。  
FROM *scratch*  
Docker 还存在一个特殊的镜像，名为 scratch。这个镜像是虚拟的概念，并不实际存在，它表示一个空白的镜像。


**Ⅱ.RUN 指令**  

RUN 用来执行命令行指令的，其有两种语法格式：*shell* 格式，*exec* 格式。命令较长是使用 *\\* 换行，使用 *&&* 链接命令。


## 注意

**1. win10 docker 中运行shell 问题**
在win10 版本得docker 环境中选择 ubuntu系统，执行 shell 可能会出现 **sh脚本异常：/bin/sh^M:bad interpreter: No such file or directory** 这个问题，原因就是win系统中编辑的shell编码格式不同，有可能是一些不可见字符导致异常。
解决办法：
1.在windows下转换：
利用一些编辑器如UltraEdit或EditPlus等工具先将脚本编码转换，再放到Linux中执行。转换方式如下（UltraEdit）：File-->Conversions-->DOS->UNIX即可。

2.在Linux中转换：
首先要确保文件有可执行权限 `chmod 777 filename`，然后修改文件格式 `vi filename`
先查看文件格式
 `:set ff` 或 `:set fileformat`
显示如下
`fileformat=dos` 或 `fileformat=unix`
再修改文件格式
`:set ff=unix` 或 `:set fileformat=unix`
`:wq` 保存退出，最后再执行文件 `./filename.sh`