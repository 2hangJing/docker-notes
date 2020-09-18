https://thisthat.dev/
https://github.com/ljianshu/Blog/issues/57

# other
1. 各种题目
https://github.com/Advanced-Frontend/Daily-Interview-Question/blob/master/datum/summary.md

# JS
1. encodeURIComponent 与 encodeURI 区别
![alt 属性文本](./image/encodeURIComponent%20与%20encodeURI%20区别.png)

# Vue
1. 响应式原理: https://juejin.im/post/6844903597986037768

Observer负责将数据转换成getter/setter形式；
Dep负责管理数据的依赖列表；是一个发布订阅模式，上游对接Observer，下游对接Watcher
Watcher是实际上的数据依赖，负责将数据的变化转发到外界(渲染、回调)；
首先将data传入Observer转成getter/setter形式；当Watcher实例读取数据时，会触发getter，被收集到Dep仓库中；当数据更新时，触发setter，通知Dep仓库中的所有Watcher实例更新，Watcher实例负责通知外界

1. diff 算法: https://juejin.im/post/6844903607913938951#heading-1
2. diff 相关: https://juejin.im/post/6844904113587634184#heading-9