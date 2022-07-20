

let gameObj = {

    winHeight: $(window).height(),
    winWidth: $(window).width(),

    //  摁压时间
    touchTime: 0,

    //  当前速度总和
    boxSpeed: 0,

    //  下落加速度
    boxConstSpeed: 5,

    //  屏幕中障碍数组
    obstacleArr: [],

    ctx: $('#canvas')[0].getContext('2d'),

    domEvent(){
        
        $(window).on('touchstart', (e)=>{

            this.touchTime = new Date().getTime();
        });

        $(window).on('touchend', (e)=>{

            this.boxConstSpeed = - (new Date().getTime() - this.touchTime) / 20;

            this.touchTime = 0;
        });
    },
    canvasInit(){
        $('#canvas').attr({
            width : this.winWidth,
            height : this.winHeight
        });

        for(var i = 0; i<50; i++){

            this.obstacleArr.push({

                //  障碍物X轴位置
                x: this.winWidth, 

                //  障碍物宽度
                width: 30 + Math.floor( Math.random() * 100),

                //  前后障碍物之间的距离
                distance: i * 350 + Math.floor( Math.random() * 150),

                //  允许通过的高度Y轴位置
                allowY: Math.floor($(window).height()* 0.3 + $(window).height()* 0.4 * Math.random().toFixed(1)),

                allowHei: Math.floor( $(window).height()* 0.2 )
            });
        };

        console.log(this.obstacleArr);
    },
    calculation(){
        
        //  下落速度总和
        this.boxSpeed += this.boxConstSpeed;

        //  下落加速度随着时间加大
        this.boxConstSpeed += 0.5;

        //  障碍物移动 X 轴速度
        for(let val of this.obstacleArr){

            val.x -= 4;
        }
    },
    rendering(){

        //  数据计算
        this.calculation();

        let {winWidth, winHeight, boxSpeed, obstacleArr, ctx} = gameObj;

        //  重置画布
        $('#canvas').attr({width : winWidth});

        //  box Y轴坐标
        let boxY = winHeight/5 + boxSpeed;

        //  障碍渲染
        for(let val of obstacleArr){

            //  障碍物 X 轴坐标
            let x = val.x + val.distance;

            ctx.fillStyle="#000";
            
            ctx.fillRect( x, 0, val.width, winHeight); 

            ctx.fillStyle="#fff";

            ctx.fillRect( x, val.allowY, val.width, val.allowHei);

            //  判断是否碰触障碍物
            if(20 - val.width <= x && x <= 50){

                if( val.allowY <= boxY && boxY <= val.allowY + val.allowHei - 30 ){
                    // alert('通过墙壁！')
                }else{

                    alert('碰到墙壁了！')
                    // console.log('你碰到墙壁了！');
                }
            }

        }

        ctx.fillStyle="#000";

        ctx.lineWidth = 1;

        //  box 
        ctx.fillRect(20, boxY, 30, 30); 

        ctx.stroke();

        requestAnimationFrame(this.rendering.bind(this));
    },
    
    init(){
        
        this.canvasInit();
        
        this.rendering();

        this.domEvent();
    }
}

gameObj.init();