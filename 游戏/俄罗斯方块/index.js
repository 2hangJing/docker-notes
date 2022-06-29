
//  10 列内容, 左右各5列填充
const Column = 10 + 5 + 5;
// 23 行内容，底部 5 行填充
const Row = 23 + 5;
// 渲染数据得二维数组
let initList = [];
// 正方形、Z字形 默认位置
let zfPoint = [], zPoint = [];
for(let i = 0; i<Row; i++){
    let row = [], zfRow = [], zRow = []
    for(let c=0; c<Column; c++){
        let status = false;
        if(i>22 || c<5 || c>14) status = true;
        if(i == 0){
            // 正方第一行数据
            zfRow.push({x: i, y: c, status: c>4 && c<7? true: status});
            // Z 字形第一行数据
            zRow.push({x: i, y: c, status: c>4 && c<7? true: status});
        }
        else if(i == 1){
            // 正方第二行数据
            zfRow.push({x: i, y: c, status: c>4 && c<7? true: status});
            // Z 字形第二行数据
            zRow.push({x: i, y: c, status: c>5 && c<8? true: status});
        }
        row.push({x: i, y: c, status});
    }
    initList.push(row);
    // 剔除空行
    !!zfRow[0] && zfPoint.push(zfRow);
    // 剔除空行
    !!zRow[0] && zPoint.push(zRow);
}

console.log( zfPoint );



const app = Vue.createApp({
    data(){
        return{
            // 当前已确定的数据
            confirmList: initList,
            // 当前渲染到页面数据
            renderList: [],
            // 当前图形数据
            currentShap: {
                // 图形第一行所在总行数索引
                firstRow: 0,
                // 图形本身占用几行
                totalRow: 0,
                // 图形当前的位置、形状
                point: []
            },
            // 几种方块，默认位置在第一行中间
            shape: {
                // 正方形
                zf: {
                    point: zfPoint,
                    
                }
            },
            
        }
    },
    created () {
       Object.assign(this.renderList, this.confirmList, this.currentShap.point);
        
    },
    methods: {
        // 当前渲染图形合并
        fnMerge(confirm=false){
            let {firstRow, totalRow, point} = this.currentShap;
            let copyConfirmList = Object.assign([], this.confirmList);
            copyConfirmList.splice(firstRow, totalRow, ...point);

            this.renderList = Object.assign([], copyConfirmList);
            
            if(confirm){
                this.confirmList = Object.assign([], this.renderList);

                this.currentShap = {
                    // 图形第一行所在总行数索引
                    firstRow: 0,
                    // 图形本身占用几行
                    totalRow: 2,
                    // 图形当前的位置、形状
                    point: zfPoint
                };
            }
        },
        fnDown(){
            this.currentShap.firstRow += 1;
            this.currentShap.totalRow = 2;
            this.currentShap.point = zPoint;
            if(this.currentShap.firstRow + this.currentShap.totalRow >22){
                this.fnMerge(true);
            }else{
                this.fnMerge(false);
            }
            
        },
        fnLeft(){
            // 行内容
            const {firstRow, totalRow, point} = this.currentShap;
            // 去除引用
            let copyPoint = JSON.parse(JSON.stringify(point));
            // 当前图形对应位置的，已确定位置数据
            const copyConfirmSlice = this.confirmList.slice(firstRow, firstRow+totalRow);
            
            let needUpdate = false;
            for(let i = 0; i<totalRow; i++){
                let needBreak = false;
                for(let c = 0; c<Column; c++){
                    if(c<5 || c>14) continue;
                    if(this.currentShap.point[i][c].status){
                        // 无法向左移动，有障碍物，不论哪一行，只要有障碍物直接退出后续逻辑，
                        if(copyConfirmSlice[i][c-1].status){
                            return;
                        }else{
                            copyPoint[i][c].status = false;
                            copyPoint[i][c-1].status = true;
                            needUpdate = true;
                        }
                    }
                }
            }
            // 上面左移且无碰撞判断后更新当前图形位置信息
            Object.assign(this.currentShap.point, copyPoint);

            needUpdate && this.fnMerge();
        },
        fnRight(){
            // 行内容
            const {firstRow, totalRow, point} = this.currentShap;
            // 去除引用
            let copyPoint = JSON.parse(JSON.stringify(point));
            // 当前图形对应位置的，已确定位置数据
            const copyConfirmSlice = this.confirmList.slice(firstRow, firstRow+totalRow);
            let needUpdate = false;
            for(let i = 0; i<totalRow; i++){
                for(let c = Column-1; c>=0; c--){
                    if(c<5 || c>14) continue;
                    if(this.currentShap.point[i][c].status){
                        // 无法向左移动，有障碍物，不论哪一行，只要有障碍物直接退出后续逻辑，
                        if(copyConfirmSlice[i][c+1].status){
                            return;
                        }else{
                            copyPoint[i][c].status = false;
                            copyPoint[i][c+1].status = true;
                            needUpdate = true;
                        }
                    }
                }
            }
            // 上面左移且无碰撞判断后更新当前图形位置信息
            Object.assign(this.currentShap.point, copyPoint);

            needUpdate && this.fnMerge();
        }

    }
}).mount('#root')
  