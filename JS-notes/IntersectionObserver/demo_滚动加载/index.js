
window.onload = function(){

    function ioCallback(entries){
        
        //  监听的 dom 在和 root 交叉时返回的dom 合集
        console.log(entries);

        //  标记DOM出现在视野，说明已经是最底部了
        if(entries[0].isIntersecting){

            let dom = document.querySelector(".content");

            setTimeout(()=>{
                
                // insertAdjacentHTML ==> https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
                document.querySelector(".content_mark").insertAdjacentHTML("beforebegin", "<div class='content'></div><div class='content'></div>");
            }, 500)

            console.log("最底部了");
        }
    }

    let ioOptions = {

        //  默认==null == 视窗 viewport
        root: document.querySelector(".tab_content"),

        //  交叉偏移值，默认 0
        rootMargin: "0px 0px 0px 0px"
    };

    let io = new IntersectionObserver(ioCallback,ioOptions);

    //  开始监听
    io.observe(document.querySelector(`.content_mark`));

    
    
}