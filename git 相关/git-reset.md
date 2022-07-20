git reset --hard HEAD^

命令解释：
HEAD^ 表示上一个版本，即上一次的commit，也可以写成 HEAD~1 如果进行两次的commit，想要都撤回，可以使用HEAD~2
–soft 不删除工作空间的改动代码 ，撤销commit，不撤销git add file
–hard 删除工作空间的改动代码，撤销commit且撤销add
