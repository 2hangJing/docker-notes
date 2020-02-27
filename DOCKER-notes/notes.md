<!--
 * @Author: monai
 * @Date: 2020-02-27 14:42:53
 * @LastEditors: monai
 * @LastEditTime: 2020-02-27 16:49:18
 -->
# docker 笔记
准备将自己的博客系统装Ubuntu中，本地开发环境是win不太方便学习，docker正好解决这个问题，先学习下docker。

*学习文章 <https://yeasy.gitbooks.io/docker_practice/image/list.html>*

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

*ocker image rm [选项] <镜像1> [<镜像2> ...]*  
*ocker image rm --help* 展示相关选项

删除本地镜像，可以使用镜像的短ID、长ID、镜像名、摘要。

