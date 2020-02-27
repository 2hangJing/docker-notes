var b = 10;

(function b(){

    b = 20;

    console.log(b);

})();

let domP = document.querySelector("p");

domP.addEventListener("click", function(){

    let text = getB();

    this.innerText = text;

    function getB(){
        
        return "修改";
    }
}, false);


function test(){

    // console.log(bb);
    var z = 10;

    // console.log(bb);
    function c(){};

    let n = "20";

    const v = 50;

    let nn = 10;

    if(1){

        let nn = 30;

        console.log(nn);
    }

    if(0){

        var zz = 20;
    }
}

test();
