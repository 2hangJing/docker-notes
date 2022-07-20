### 参考：https://blog.csdn.net/jiohfgj/article/details/115478036

git clean 从你的工作目录中删除所有没有 tracked，没有被管理过的文件。

clean用法详解，参数说明：
1. n ：显示将要被删除的文件
2. d ：删除未被添加到 git 路径中的文件（将 .gitignore 文件标记的文件全部删除）
3. f ：强制运行
4. x ：删除没有被 track 的文件

示例：
```git
git clean -d -fx
```
