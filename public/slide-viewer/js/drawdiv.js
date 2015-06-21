/*
	drawdiv.js is able to draw as many divs as you want inside an other div.
	If you want to change the rootdiv, just call changeRootDiv(newRootDiv).
*/

//settings
var rootDivId = 'slideWrapper'
var rootDivDom = $('#'+rootDivId);
var rect = {};
var drag = false;
var element = null;
var elementTag = null;
var startXRel;
var startYRel;
var mouseleftCanvas=false;
var divCounter=0;
var animation = true;
var bBackgroundColor = "#00fff2";
var bWidth ="3";
var bRadius = "4";
var tagFontSizeFactor = 0.0275;
var tagFontSize = 10;
var tagOffsetLeft = 2;
var tagOffsetTop = tagFontSize+6; //textsize + small offset
var tagPaddingLeftRight = 3;
var rectPrefix = "rect-";
var opacityFactor ="0.125";
var opacityFactorHighlight ="0.5";

var currentCanvasHeight=0;
var min_height_rect_rel=0.06;
var max_height_rect_rel=0.55;
var min_width_rect_rel=0.06;
var max_width_rect_rel=0.75;

var min_height_rect_abs=50;
var max_height_rect_abs=300;
var min_width_rect_abs=50;
var max_width_rect_abs=300;


var currentTagName="";
var currentTagColor="";

function initRects() {
/*canvas.addEventListener('mousedown', mouseDown, false);
 	canvas.addEventListener('mouseup', mouseUp, false);
	canvas.addEventListener('mousemove', mouseMove, false);
	canvas.addEventListener('mouseleave', mouseLeave, false);*/
	rootDivDom.bind('mousedown', mouseDown);
	rootDivDom.bind('mouseup', mouseUp);
	rootDivDom.bind('mousemove', mouseMove);
	rootDivDom.bind('mouseleave', mouseLeave);

}

function mouseDown(e){
	if(e.which!=3){
		console.log("mousedown");
		element = $('<div/>', {
			id: rectPrefix+divCounter,
			position: 'absolute',
			class: 'slideRect debug',
			width: '10%',
			height: '10%',
			opacity: opacityFactorHighlight
		});
		element.css({
			left:"22%",
			top: "33%",
			position: 'absolute'
		});
		element.appendTo('#slideWrapper');
	}

}

function mouseUp(e){
	console.log("mouseup");
}

function mouseMove(e){
	console.log("mousemove");
}

function mouseLeave(e){
	console.log("mouseleave");
}
//predefined variables




console.log("test: "+rootDivDom.height());
initRects();


/*
	//Drawrect.js is able to draw as many divs as you want on a single canvas. the canvas needs to be a div NOT a canvas. The id of the canvas has the id rectCanvas.
	//If you want to change the canvas, just call changeCanvas(newCanvas).

var canvasName = 'slideWrapper';
var canvas = document.getElementById(canvasName);
//var canvas = document.getElementById('rectCanvas');
var rect = {};
var drag = false;
var element = null;
var elementTag = null;
var startXRel;
var startYRel;
var mouseleftCanvas=false;
var divCounter=0;
var animation = true;
var bBackgroundColor = "#00fff2";
var bWidth ="3";
var bRadius = "4";
var tagFontSizeFactor = 0.0275;
var tagFontSize = 10;
var tagOffsetLeft = 2;
var tagOffsetTop = tagFontSize+6; //textsize + small offset
var tagPaddingLeftRight = 3;
var rectPrefix = "rect-";
var opacityFactor ="0.125";
var opacityFactorHighlight ="0.5";

var currentCanvasHeight=0;
var min_height_rect_rel=0.06;
var max_height_rect_rel=0.55;
var min_width_rect_rel=0.06;
var max_width_rect_rel=0.75;

var min_height_rect_abs=50;
var max_height_rect_abs=300;
var min_width_rect_abs=50;
var max_width_rect_abs=300;

var currentTagName="";
var currentTagColor="";


function getCurrentTagColor(){
	return currentTagColor;
}
function setCurrentTagColor(tTagColor){
	currentTagColor=tTagColor;
}
function getCurrentTagName(){
	return currentTagName;
}
function setCurrentTagName(tTagName){
	currentTagName=tTagName;
}

function changeCanvas(tCanvas){
	if(tCanvas==null){
		console.log("your Canvas is invalid, please enter an valid canvas id");
	}else{
		canvas=tCanvas;
	}
}

function initRects() {
  	canvas.addEventListener('mousedown', mouseDown, false);
 	canvas.addEventListener('mouseup', mouseUp, false);
  	canvas.addEventListener('mousemove', mouseMove, false);
  	canvas.addEventListener('mouseleave', mouseLeave, false);
}
function setColor(hexColor){
	bBackgroundColor=hexColor;
}
function mouseDown(e) {
	if(e.which!=3){
			if(!mouseleftCanvas){
				if(e.pageX - this.offsetLeft > (min_width_rect_abs/2)){
					if(e.pageX - this.offsetLeft< parseInt($('#'+canvasName).width())- (min_width_rect_abs/2)){
						startXRel = e.pageX - this.offsetLeft - (min_width_rect_abs/2);
					}else{
						startXRel = parseInt($('#'+canvasName).width())- min_width_rect_abs;
					}
				}else{
					startXRel = 0;
				}

				if(e.pageY - this.offsetTop > (min_height_rect_abs/2)){
					if(e.pageY - this.offsetTop< parseInt($('#'+canvasName).height())- (min_height_rect_abs/2)){
						startYRel = e.pageY - this.offsetTop - (min_height_rect_abs/2);

					}else{
						startYRel = parseInt($('#'+canvasName).height())- min_height_rect_abs;
					}
				}else{
					startYRel = 0;
				}

				element = document.createElement('div');
				element.className = element.className+ "slideRect hideTrigger";
				element.style.position = "absolute";
				element.id = rectPrefix+divCounter;
				element.style.opacity = opacityFactorHighlight;

				//tag
				element.setAttribute("data-tagName","#"+getCurrentTagName());

				//setting drawed div on activeRect
				element.className = element.className+ " activeRect tagname-"+element.getAttribute("data-tagName").slice(1);

				//style
				element.style.backgroundColor = getCurrentTagColor();
				element.style.border = bWidth+"px solid "+darkenBoarder(element.style.backgroundColor);
				element.style.borderRadius = bRadius+"px";

				//transition
				element.style.setProperty("-moz-transition", "opacity 0.1s linear");
				element.style.setProperty("-ms-transition", "opacity 0.1s linear");
				element.style.setProperty("-o-transition", "opacity 0.1s linear");
				element.style.setProperty("transition", "opacity 0.1s linear");

				//geometrical
				element.setAttribute("data-relstartcoord",(startXRel+";"+startYRel));

				element.style.left = absToViewLeft(startXRel, this) + 'px';
				element.style.top = absToViewTop(startYRel, this) + 'px';
				element.style.width = min_width_rect_abs+'px';
				element.style.height = min_height_rect_abs+'px';
				canvas.appendChild(element);



				//tag-span
				elementTag = document.createElement('span');
				elementTag.className = elementTag.className+ "slideRectTag hideTrigger debug";
				elementTag.style.position = "absolute";
				elementTag.id = "tag-"+rectPrefix+divCounter;
				elementTag.style.backgroundColor = "black";
				elementTag.style.color = "white";
				elementTag.style.fontSize = parseInt(tagFontSize) + "px";
				elementTag.innerText = "#"+getCurrentTagName();
				elementTag.style.left = absToViewLeft(startXRel, this) +tagOffsetLeft + 'px';
				elementTag.style.top =  absToViewTop(startYRel, this) -tagOffsetTop + 'px';
				elementTag.style.paddingLeft = tagPaddingLeftRight+ "px";
				elementTag.style.paddingRight = tagPaddingLeftRight+ "px";
				elementTag.style.setProperty("-moz-border-radius", "0px");
				elementTag.style.setProperty("-webkit-border-radius", "4px 4px 0px 0px");
				elementTag.style.setProperty("border-radius", "4px 4px 0px 0px");
				elementTag.style.setProperty("-webkit-user-select","none");
				elementTag.style.setProperty("-moz-user-select","none");
				elementTag.style.setProperty("-ms-user-select","none");
				elementTag.style.setProperty("-moz-transition", "opacity 0.1s linear");
				elementTag.style.setProperty("-ms-transition", "opacity 0.1s linear");
				elementTag.style.setProperty("-o-transition", "opacity 0.1s linear");
				elementTag.style.setProperty("transition", "opacity 0.1s linear");
				element.setAttribute("data-relwidthheight", Math.abs(min_width_rect_abs)+";"+Math.abs(min_height_rect_abs));
				elementTag.setAttribute("data-relstartcoord", (parseInt(startXRel)+parseInt(tagOffsetLeft)) + ";" + (parseInt(startYRel)-parseInt(tagOffsetTop)));
				canvas.appendChild(elementTag);

				appendClickEventOnRect();


			  	//mouseleftCanvas=false;
	 			drag=true;
		  	}else{
		  		mouseleftCanvas=false;
		  	}
		  	canvas.style.cursor = "crosshair";
	}
}


function mouseUp() {
		canvas.appendChild(element);
		elementTag.style.opacity = 0;
		canvas.style.cursor = "default";
		divCounter=divCounter+1;
		$("#slideWrapper").removeClass("editModeOuterline");
	  	drag = false;

}

function mouseMove(e) {
  if (drag) {
  	var currentX = e.pageX - this.offsetLeft;
  	var currentY = e.pageY - this.offsetTop;
   	var divWidth = currentX - startXRel;
    var divHeight = currentY - startYRel;
    var relSaveX=0;
    var relSaveY=0;


    if(currentX - startXRel < 0){
	    if((max_width_rect_abs-min_width_rect_abs)<Math.abs(currentX - startXRel)){
	    	relSaveX = startXRel-(max_width_rect_abs-min_width_rect_abs);
	    	element.style.left = this.offsetLeft + relSaveX + 'px';
	    	elementTag.style.left = this.offsetLeft + relSaveX +tagOffsetLeft+ 'px';
	    	divWidth = max_width_rect_abs;
	    }else{
	    	relSaveX =currentX;
	    	element.style.left = this.offsetLeft + relSaveX + 'px';
	    	elementTag.style.left = this.offsetLeft + relSaveX +tagOffsetLeft+ 'px';
	    	divWidth = Math.abs(currentX - startXRel)+ min_width_rect_abs;
	    }
    }else{
    	if((currentX-startXRel)<min_width_rect_abs){
    		relSaveX =startXRel;
    		element.style.left =this.offsetLeft+relSaveX + 'px';
    		elementTag.style.left =this.offsetLeft+relSaveX +tagOffsetLeft+ 'px';
    		divWidth = min_width_rect_abs;
    	}else{
    		relSaveX=startXRel;
	    	element.style.left = this.offsetLeft+relSaveX + 'px';
	    	elementTag.style.left = this.offsetLeft+relSaveX+tagOffsetLeft + 'px';
    		if((currentX-startXRel)>max_width_rect_abs){
    			divWidth= max_width_rect_abs;
    		}else{
    			divWidth = currentX-startXRel;
    		}
    	}

    }
    element.style.width = Math.abs(divWidth) + 'px';

    if(currentY - startYRel < 0){
	    if((max_height_rect_abs-min_height_rect_abs)<Math.abs(currentY - startYRel)){
	    	relSaveY = startYRel-(max_height_rect_abs-min_height_rect_abs);

	    	element.style.top = this.offsetTop + relSaveY + 'px';
	    	elementTag.style.top = this.offsetTop + relSaveY -tagOffsetTop + 'px';
	    	divHeight = max_height_rect_abs;
	    }else{
	    	relSaveY =currentY;
	    	element.style.top = this.offsetTop + relSaveY + 'px';
			elementTag.style.top = this.offsetTop + relSaveY -tagOffsetTop + 'px';

	    	divHeight = Math.abs(currentY - startYRel)+ min_height_rect_abs;
	    }
    }else{
    	if((currentY-startYRel)<min_height_rect_abs){
    		relSaveY =startYRel;
    		element.style.top =this.offsetTop+ relSaveY + 'px';
    		elementTag.style.top =this.offsetTop+ relSaveY -tagOffsetTop + 'px';
    		divHeight = min_height_rect_abs;
    	}else{
    		relSaveY = startYRel;
	    	element.style.top = this.offsetTop+relSaveY + 'px';
	    	elementTag.style.top = this.offsetTop+relSaveY-tagOffsetTop + 'px';
    		if((currentY-startYRel)>max_height_rect_abs){
    			divHeight= max_height_rect_abs;
    		}else{
    			divHeight = currentY-startYRel;
    		}
    	}

    }
    element.style.height = Math.abs(divHeight) + 'px';

    element.setAttribute("data-relwidthheight", Math.abs(divWidth)+";"+Math.abs(divHeight));
    element.setAttribute("data-relstartcoord", relSaveX +";"+relSaveY);
  }
}

function mouseLeave(e){
	if(drag){mouseleftCanvas=true;}
}

function absToViewTop(relToView,canvas){
	return canvas.offsetTop+parseInt(relToView,10);
}
function absToViewLeft(relToView,canvas){
	return canvas.offsetLeft+parseInt(relToView,10);
}

function getRrbArray(rgb){
    rgb = rgb.replace(/[^\d,]/g, '').split(',');
    return rgb;
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}
function darkenBoarder(string){
	var lumientFactor = 0.4;
	a = getRrbArray(string);
	var hsl =rgbToHsl(a[0],a[1],a[2]);
	var oldLumient = hsl[2];
	var newLumient = hsl[2]*lumientFactor;
	if(oldLumient-newLumient <= 15 ? newLumient = 60 : newLumient)
	var hslString =  "hsl("+hsl[0]+ ", "+hsl[1]+"%, "+newLumient+"%)";
	return hslString;
}
function getRandomColor(){
	return '#' + (function co(lor){   return (lor +=
  [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)])
  && (lor.length == 6) ?  lor : co(lor); })('');
}
function rescalingRects(rectClassName,tagClassName){
	var allElements = document.getElementsByClassName(rectClassName);
	var scalingFactor = parseInt(canvas.style.height)/currentCanvasHeight;
	var allElementsTag = document.getElementsByClassName(tagClassName)
	tagFontSize = parseInt(canvas.style.height)*tagFontSizeFactor;
	tagOffsetTop = tagFontSize+4;
	//console.log("Scaling factor: "+scalingFactor);

	for (var i = 0, len = allElements.length; i < len; i++) {

		var coordAttr=allElements[i].getAttribute("data-relstartcoord").split(";");
		var startXAttr = coordAttr[0]*scalingFactor;
		var startYAttr = coordAttr[1]*scalingFactor;
		allElements[i].setAttribute("data-relstartcoord",startXAttr+";"+startYAttr);
    	allElements[i].style.left = Math.round(absToViewLeft(startXAttr,canvas)) +"px";
		allElements[i].style.top = Math.round(absToViewTop(startYAttr, canvas)) +"px";
		allElements[i].style.height = Math.round(parseInt(allElements[i].style.height)*scalingFactor) +"px";
		allElements[i].style.width = Math.round(parseInt(allElements[i].style.width)*scalingFactor) +"px";
	}
	for (var i = 0, len = allElementsTag.length; i < len; i++) {

		var coordAttr=allElementsTag[i].getAttribute("data-relstartcoord").split(";");
		var startXAttr = coordAttr[0]*scalingFactor;
		var startYAttr = coordAttr[1]*scalingFactor;
		allElementsTag[i].setAttribute("data-relstartcoord",startXAttr+";"+startYAttr);
    	allElementsTag[i].style.left = Math.round(absToViewLeft(startXAttr,canvas)) +"px";
		allElementsTag[i].style.top = Math.round(absToViewTop(startYAttr, canvas)) +"px";
		allElementsTag[i].style.fontSize = tagFontSize +"px";
	}
	currentCanvasHeight=parseInt(canvas.style.height);

}

function alwaysRescaleRects(){
	rescalingRects("slideRect", "slideRectTag");
	currentCanvasHeight=parseInt(canvas.style.height);

	tagFontSize = currentCanvasHeight*tagFontSizeFactor;
	tagOffsetTop = tagFontSize+4;

	min_height_rect_abs=currentCanvasHeight*min_height_rect_rel;
	max_height_rect_abs=currentCanvasHeight*max_height_rect_rel;
	min_width_rect_abs=currentCanvasHeight*min_width_rect_rel;
	max_width_rect_abs=currentCanvasHeight*max_width_rect_rel;

}
window.addEventListener('load', function(){
	currentCanvasHeight=parseInt(canvas.style.height);

	tagFontSize = currentCanvasHeight*tagFontSizeFactor;
	tagOffsetTop = tagFontSize+4;

	min_height_rect_abs=currentCanvasHeight*min_height_rect_rel;
	max_height_rect_abs=currentCanvasHeight*max_height_rect_rel;
	min_width_rect_abs=currentCanvasHeight*min_width_rect_rel;
	max_width_rect_abs=currentCanvasHeight*max_width_rect_rel;

}, true);

function loadRect(relLeft, relTop, relWidth, relHeight, color, tagname){
	//console.log(relLeft, relTop, relWidth, relHeight, color, tagname);



	element = document.createElement('div');
	element.className = element.className+ "slideRect visuallyhiddenRect hideTrigger tagname-"+tagname.slice(1);
	element.style.position = "absolute";
	element.id = rectPrefix+divCounter;

	//tag
	element.setAttribute("data-tagName",tagname);

	//style
	element.style.backgroundColor = color;
	element.style.border = bWidth+"px solid "+darkenBoarder(element.style.backgroundColor);
	element.style.borderRadius = bRadius+"px";

	//transition
	element.style.setProperty("-moz-transition", "opacity 0.1s linear");
	element.style.setProperty("-ms-transition", "opacity 0.1s linear");
	element.style.setProperty("-o-transition", "opacity 0.1s linear");
	element.style.setProperty("transition", "opacity 0.1s linear");

	//geometrical GESETZT!!!!!!
	var currCanWidth = $("#"+canvasName).width();
	var attrRelLeft = relLeft*currCanWidth;
	var currCanHeight = $("#"+canvasName).height();
	var attrRelTop  = relTop* currCanHeight;

	element.setAttribute("data-relstartcoord",(attrRelLeft+";"+attrRelTop));
	element.style.left = absToViewLeft(attrRelLeft, canvas) + 'px';
	element.style.top = absToViewTop(attrRelTop, canvas) + 'px';
	element.style.width = (currCanWidth*relWidth)+'px';
	element.style.height = (currCanHeight*relHeight)+'px';
	element.style.opacity = opacityFactor;
	canvas.appendChild(element);





	//tag-span
	elementTag = document.createElement('span');
	elementTag.className = elementTag.className+ "slideRectTag visuallyhiddenRect hideTrigger";
	elementTag.style.position = "absolute";
	elementTag.id = "tag-"+rectPrefix+divCounter;
	elementTag.style.backgroundColor = "black";
	elementTag.style.color = "white";
	elementTag.style.fontSize = parseInt(tagFontSize) + "px";
	elementTag.innerText = tagname;
	elementTag.style.left = absToViewLeft(attrRelLeft, canvas) +tagOffsetLeft + 'px';
	elementTag.style.top =  absToViewTop(attrRelTop, canvas) -tagOffsetTop + 'px';
	elementTag.style.paddingLeft = tagPaddingLeftRight+ "px";
	elementTag.style.paddingRight = tagPaddingLeftRight+ "px";
	elementTag.style.setProperty("-moz-border-radius", "0px");
	elementTag.style.setProperty("-webkit-border-radius", "4px 4px 0px 0px");
	elementTag.style.setProperty("border-radius", "4px 4px 0px 0px");
	elementTag.style.setProperty("-webkit-user-select","none");
	elementTag.style.setProperty("-moz-user-select","none");
	elementTag.style.setProperty("-ms-user-select","none");
	elementTag.style.setProperty("-moz-transition", "opacity 0.1s linear");
	elementTag.style.setProperty("-ms-transition", "opacity 0.1s linear");
	elementTag.style.setProperty("-o-transition", "opacity 0.1s linear");
	elementTag.style.setProperty("transition", "opacity 0.1s linear");
	elementTag.style.opacity = 0;

	elementTag.setAttribute("data-relstartcoord", (parseInt(attrRelLeft)+parseInt(tagOffsetLeft)) + ";" + (parseInt(attrRelTop)-parseInt(tagOffsetTop)));
	canvas.appendChild(elementTag);
	if(animation){
        var tl = new TimelineMax();
        tl.append(TweenMax.fromTo("#"+element.id,.15, {scale:1.02}, {css:{scale:1}, ease:Quad.easeIn}));
        oTransitionRect(element.id,"tagname-"+tagname.slice(1), opacityFactor, opacityFactorHighlight);
	}
	divCounter=divCounter+1;



}
function deleteRects(){
	$(".slideRect").each(function(){
		$(this).remove();
	});
	$(".slideRectTag").each(function(){
		$(this).remove();
	});
}

//init Canvas
changeCanvas(canvas);

initRects();


function appendClickEventOnRect(){
	$(".slideRect").each(function(){
		$(this).click(function(){
			var text = "test";
			if(text.slice(-1)==" "){
				$(".activeTextArea").val( text+ $(this).attr("data-tagName"));
			}else{
				$(".activeTextArea").val( text+ " "+ $(this).attr("data-tagName"));
			}

		});
	});
}
*/
