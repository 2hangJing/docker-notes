### 完整克隆
`git clone xxxxx`

#### 克隆最后一次 commit 的分支

有时仓库很大，此时完整克隆太耗费时间，此时可以只克隆仓库最后一次 commit 的分支：
`git clone xxxxx --depth 1`

克隆部分后可以执行如下指令恢复完整克隆：
`git fetch --unshallow`


