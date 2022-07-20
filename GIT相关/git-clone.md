### 完整克隆
`git clone xxxxx`

#### 克隆最后一次 commit 的分支

有时仓库很大，此时完整克隆太耗费时间，此时可以只克隆仓库最后一次 commit 的分支：
`git clone xxxxx --depth 1`

克隆部分后可以执行如下指令恢复完整克隆：
`git fetch --unshallow`

#### 只克隆指定分支
`git clone --single-branch --branch 分支名 git仓库地址`

此时仓库只有当前一个分支，如下方式获取其他远程分支：
`git remote set-branches --add origin 分支名`
`git fetch origin 分支名`

## 参考
https://www.zhihu.com/question/38305012