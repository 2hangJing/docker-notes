"use strict";
/* 0. Initialization */
// Get height on Window resized
$(window).on('resize',function(){
    var slideHeight = $('.slick-track').innerHeight();
	return false;
});


// Smooth scroll <a> links 
var $root = $('html, body');
$('a.s-scroll').on('click',function() {
    var href = $.attr(this, 'href');
    $root.animate({
        scrollTop: $(href).offset().top
    }, 500, function () {
        window.location.hash = href;
    });
    return false;
});

/* 2. Background for page / section */

var background = '#ccc';
var backgroundMask = 'rgba(255,255,255,0.92)';
var backgroundVideoUrl = 'none';

/* Background image as data attribut */
var list = $('.bg-img');

for (var i = 0; i < list.length; i++) {
	var src = list[i].getAttribute('data-image-src');
	list[i].style.backgroundImage = "url('" + src + "')";
	list[i].style.backgroundRepeat = "no-repeat";
	list[i].style.backgroundPosition = "center";
	list[i].style.backgroundSize = "cover";
}

/* Background color as data attribut */
var list = $('.bg-color');
for (var i = 0; i < list.length; i++) {
	var src = list[i].getAttribute('data-bgcolor');
	list[i].style.backgroundColor = src;
}

/* Background slide show Background variables  */
var imageList = $('.slide-show .img');
var imageSlides = [];
for (var i = 0; i < imageList.length; i++) {
	var src = imageList[i].getAttribute('data-src');
	imageSlides.push({src: src});
}


/* Slide Background variables */
var isSlide = false;
var slideElem = $('.slide');
var arrowElem = $('.p-footer .arrow-d');
var pageElem = $('.page');

/* 3. Init all plugin on load */
$(document).ready(function() {
	/* Init console to avoid error */
	var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
	
	/* Init Slidesow background */
	 $('.slide-show').vegas({
        delay: 5000,
        shuffle: true,
        slides: imageSlides,
    	//transition: [ 'zoomOut', 'burn' ],
		animation: [ 'kenburnsUp', 'kenburnsDown', 'kenburnsLeft', 'kenburnsRight' ]
    });
	
	/* Init video background */
	$('.video-container video, .video-container object').maximage('maxcover');
	
	/* Init youtube video background */
	if(backgroundVideoUrl != 'none'){
        
        //disable video background for smallscreen
        if($(window).width() > 640){
          $.okvideo({ source: backgroundVideoUrl,
                    adproof: true
                    });
        }
    }
	
	/** Init fullpage.js */
    $('#mainpage').fullpage({
		menu: '#qmenu',
		anchors: ['one',  'two', 'three', 'four'],
//        verticalCentered: false,
//        resize : false,
//		responsive: 900,
		scrollOverflow: true,
        css3: false,
        navigation: true,
		onLeave: function(index, nextIndex, direction){
			arrowElem.addClass('gone');
			pageElem.addClass('transition');
//			$('.active').removeClass('transition');
			slideElem.removeClass('transition');
			isSlide = false;
		},
        afterLoad: function(anchorLink, index){
			arrowElem.removeClass('gone');
			pageElem.removeClass('transition');
			if(isSlide){
				slideElem.removeClass('transition');
			}
		},
		
        afterRender: function(){}
    });
});

var endTime = new Date();
    endTime.setYear(2020)

    endTime.setMonth(0,29);

    endTime.setHours(18,0,0,0);
var days = document.getElementById('days');
var hours = document.getElementById('hours');
var minutes = document.getElementById('minutes');
var seconds = document.getElementById('seconds');

function timeLoop(){
    var startTime = new Date();
    var num = endTime.getTime()-startTime.getTime();
    var day = parseInt(num/1000/60/60/24);
    var hh = parseInt((num/1000/60/60/24 - day)*24);
    var mm = parseInt(((num/1000/60/60/24 - day)*24-hh)*60);
    var ss = parseInt((((num/1000/60/60/24 - day)*24-hh)*60-mm)*60);
    hours.innerText = hh;
    minutes.innerText = mm;
    seconds.innerText = ss;
    days.innerText = day;
}

window.setInterval(timeLoop,500);

var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://www.ismoon.cn/invitation/bg.mp3', true);
xhr.addEventListener('progress', function (event) {
  // 响应头要有Content-Length
  if (event.lengthComputable) {
        var el = document.getElementById("pp");

        var ss = Math.floor((event.loaded/event.total)*100);

        el.innerHTML = ss + "%";

        if(ss == 100){
            
            $(el).fadeOut("fast",function(){

                $('#loadingText').fadeIn();
            });

            $('#audioMusic').attr('src', 'http://www.ismoon.cn/invitation/bg.mp3');

            $('#loading').on('click',function(){
                $('#audioMusic')[0].play();

                $(this).fadeOut("800",function(){
                    $(this).remove();
                });
            });
            
        }
  }
}, false);
xhr.send();

$('.jp-play').on('click',function(){
    $('#audioMusic')[0].play();
    $(this).css('display', 'none');
    $('.jp-pause').css('display', 'block');
})

$('.jp-pause').on('click',function(){
    $('#audioMusic')[0].pause();
    $(this).css('display', 'none');
    $('.jp-play').css('display', 'block');
})

document.body.addEventListener('touchmove', function (e) {

    e.preventDefault()
}, {passive: false});
