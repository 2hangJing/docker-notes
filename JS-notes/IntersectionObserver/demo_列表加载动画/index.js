
window.onload = function(){

    function ioCallback(entries){
        
        //  监听的 dom 在和 root 交叉时返回的dom 合集
        console.log(entries);

        entries.forEach(element => {

            element.target.classList[element.isIntersecting ? "add" : "remove"]("content_active");
        });
    }

    let ioOptions = {

        //  默认==null == 视窗 viewport
        root: document.querySelector(".tab_content"),

        //  交叉偏移值，默认 0
        rootMargin: "0px 0px 0px 0px"
    };

    let io = new IntersectionObserver(ioCallback,ioOptions);

    document.querySelectorAll(`.tab_content_warp>.content`).forEach(item => {
  
        //  开始监听
        io.observe(item);
    });

    
    
}