/*
	drawdiv.js is able to draw as many divs as you want inside an other div.
	If you want to change the rootdiv, just call changeRootDiv(newRootDiv).
*/

//settings
var rootDivId ='annotationZone';
var rootDivDom = $('#annotationZone');
var rectPrefix = "rect-";
var divCounter = 0;
var drag = false;

var startXRel;
var startYRel;


var opacityFactor ="0.125";
var opacityFactorHighlight ="0.5";

//Random Values
var tagFontSize = 1;
var tagIffsetTop =4;


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

var bWidth ="3";
var bRadius = "4";



function absToViewTop(relToView,canvas){
	//console.log(rootDivDom.offset().top);
	return rootDivDom.offset().top+parseInt(relToView,10);
}
function absToViewLeft(relToView,canvas){
	//console.log("CHECK: "+ relToView);
	return rootDivDom.offset().left+parseInt(relToView,10);
}

function getCurrentTagName(){
	return currentTagName;
}

function setCurrentTagName(tTagName){
	currentTagName=tTagName;
}
function getCurrentTagColor(){
	return currentTagColor;
}
function setCurrentTagColor(tTagColor){
	currentTagColor=tTagColor;
}

function initRects() {
	//rootDivDom.bind('mousedown', mouseDown);
	//rootDivDom.bind('mouseup', mouseUp);
	//rootDivDom.bind('mousemove', mouseMove);
	//rootDivDom.bind('mouseleave', mouseLeave);
}
function appendClickEventOnRect(){
	$(".slideRect").each(function(){
		$(this).click(function(){
			var text = $(".activeTextArea").val();
			if(text.slice(-1)==" "){
				$(".activeTextArea").val( text+ $(this).attr("data-tagName"));
			}else{
				$(".activeTextArea").val( text+ " "+ $(this).attr("data-tagName"));
			}

		});
	});
}

function mouseDown(e){
	if(e.which!=3){


		if(e.pageX - rootDivDom.offset().left > (min_width_rect_abs/2)){
			if(e.pageX - rootDivDom.offset().left< parseInt(rootDivDom.width())- (min_width_rect_abs/2)){
				startXRel = e.pageX - rootDivDom.offset().left - (min_width_rect_abs/2);
			}else{
				startXRel = parseInt(rootDivDom.width())- min_width_rect_abs;

			}
		}else{
			startXRel = 0;
		}
		if(e.pageY - rootDivDom.offset().top > (min_height_rect_abs/2)){
			if(e.pageY - rootDivDom.offset().top< parseInt(rootDivDom.height())- (min_height_rect_abs/2)){
				startYRel = e.pageY - rootDivDom.offset().top - (min_height_rect_abs/2);
			}else{
				startYRel = parseInt(rootDivDom.height())- min_height_rect_abs;
			}
		}else{
			startYRel = 0;
		}


		//creating Div with default values
		element = $('<div/>', {
			id: rectPrefix+divCounter,
			position: 'absolute',
			class: 'slideRect debug',
			opacity: opacityFactorHighlight
		});
 //CHANGE LATER
		element.css({
			position: 'absolute',
			backgroundColor: getCurrentTagColor(),
			borderRadius: bWidth+"px solid #C1E0FF",
		});


		//tag
		element.attr("data-tagName","#"+getCurrentTagName());

		//setting drawed div on activeRects
		element.className = element.className+ " activeRect tagname-"+element.attr("data-tagName").slice(1);


		//transition //CHECK IF THIS LINES ARE CORRECT
		element.prop("-moz-transition", "opacity 0.1s linear");
		element.prop("-ms-transition", "opacity 0.1s linear");
		element.prop("-o-transition", "opacity 0.1s linear");
		element.prop("transition", "opacity 0.1s linear");


		element.attr("data-relstartcoord",(startXRel+";"+startYRel));




		element.offset({left: absToViewLeft(startXRel, this)});
		element.offset({top: absToViewLeft(startYRel, this)});
		element.width(min_width_rect_abs);
		element.height(min_height_rect_abs);
		element.appendTo('#annotationZone');


		appendClickEventOnRect();
		drag=true;
	}

}

function mouseUp(e){
		element.appendTo('#annotationZone');
	/*elementTag.style.opacity = 0;
	if(animation){
				var tl = new TimelineMax();
				tl.append(TweenMax.fromTo("#"+element.id,.15, {scale:1.02}, {css:{scale:1}, ease:Quad.easeIn}));
				oTransitionRect(element.id,"tagname-"+element.getAttribute("data-tagName").slice(1), opacityFactor, opacityFactorHighlight);
	}
	canvas.style.cursor = "default";*/
	divCounter=divCounter+1;
  drag = false;


	addAnnotationZoneElement(element);
}

function mouseMove(e){
	if (drag) {
  	var currentX = e.pageX - rootDivDom.offset().left;
  	var currentY = e.pageY - rootDivDom.offset().top;
   	var divWidth = currentX - startXRel;
    var divHeight = currentY - startYRel;
    var relSaveX=0;
    var relSaveY=0;


    if(currentX - startXRel < 0){
	    if((max_width_rect_abs-min_width_rect_abs)<Math.abs(currentX - startXRel)){
	    	relSaveX = startXRel-(max_width_rect_abs-min_width_rect_abs);
	    	element.offset({left: rootDivDom.offset().left+ relSaveX});
	    	//elementTag.style.left = this.offsetLeft + relSaveX +tagOffsetLeft+ 'px';
	    	divWidth = max_width_rect_abs;
	    }else{
	    	relSaveX =currentX;
				element.offset({left: rootDivDom.offset().left+ relSaveX});
	    	//elementTag.style.left = this.offsetLeft + relSaveX +tagOffsetLeft+ 'px';
	    	divWidth = Math.abs(currentX - startXRel)+ min_width_rect_abs;
	    }
    }else{
    	if((currentX-startXRel)<min_width_rect_abs){
    		relSaveX =startXRel;
				element.offset({left: rootDivDom.offset().left+ relSaveX});
    		//elementTag.style.left =this.offsetLeft+relSaveX +tagOffsetLeft+ 'px';
    		divWidth = min_width_rect_abs;
    	}else{
    		relSaveX=startXRel;
	    	element.offset({left: rootDivDom.offset().left+ relSaveX});
	    	//elementTag.style.left = this.offsetLeft+relSaveX+tagOffsetLeft + 'px';
    		if((currentX-startXRel)>max_width_rect_abs){
    			divWidth= max_width_rect_abs;
    		}else{
    			divWidth = currentX-startXRel;
    		}
    	}

    }
    element.width (Math.abs(divWidth));

    if(currentY - startYRel < 0){
	    if((max_height_rect_abs-min_height_rect_abs)<Math.abs(currentY - startYRel)){
	    	relSaveY = startYRel-(max_height_rect_abs-min_height_rect_abs);
				element.offset({top: rootDivDom.offset().top+ relSaveY});
	    	//elementTag.style.top = this.offsetTop + relSaveY -tagOffsetTop + 'px';
	    	divHeight = max_height_rect_abs;
	    }else{
	    	relSaveY =currentY;
	    	element.offset({top: rootDivDom.offset().top+ relSaveY});
				//elementTag.style.top = this.offsetTop + relSaveY -tagOffsetTop + 'px';

	    	divHeight = Math.abs(currentY - startYRel)+ min_height_rect_abs;
	    }
    }else{
    	if((currentY-startYRel)<min_height_rect_abs){
    		relSaveY =startYRel;
				element.offset({top: startYRel+  rootDivDom.offset().top});
    		//elementTag.style.top =this.offsetTop+ relSaveY -tagOffsetTop + 'px';
    		divHeight = min_height_rect_abs;
    	}else{
    		relSaveY = startYRel;

				element.offset({top: rootDivDom.offset().top+ relSaveY});
	    	//elementTag.style.top = this.offsetTop+relSaveY-tagOffsetTop + 'px';
    		if((currentY-startYRel)>max_height_rect_abs){
    			divHeight= max_height_rect_abs;
    		}else{
    			divHeight = currentY-startYRel;
    		}
    	}

    }
    element.height(Math.abs(divHeight));

    element.attr("data-relwidthheight", Math.abs(divWidth)+";"+Math.abs(divHeight));
    element.attr("data-relstartcoord", relSaveX +";"+relSaveY);
  }

}

function mouseLeave(e){
	if(drag){mouseleftCanvas=true;}
}


function rescalingRects(rectClassName,tagClassName){
	var allElements = $("."+rectClassName);
	var scalingFactor = parseInt(rootDivDom.height())/currentCanvasHeight;
	//console.log("height "+ rootDivDom.height() + " currentCanvasHeight"+ currentCanvasHeight)
	/*var allElementsTag = $("."+tagClassName);
	tagFontSize = parseInt(rootDivDom.height())*tagFontSizeFactor;*/
	tagOffsetTop = tagFontSize+4;
	//console.log("Scaling factor: "+scalingFactor);

	for (var i = 0, len = allElements.length; i < len; i++) {
		var coordAttr=$(allElements[i]).attr("data-relstartcoord").split(";");
		var startXAttr = coordAttr[0]*scalingFactor;
		var startYAttr = coordAttr[1]*scalingFactor;
  	$(allElements[i]).attr("data-relstartcoord",startXAttr+";"+startYAttr);
		$(allElements[i]).css('left',  Math.round(startXAttr));
		$(allElements[i]).css('top',  Math.round(startYAttr));
  	$(allElements[i]).css('height',  Math.round(parseInt($(allElements[i]).css('height'))*scalingFactor));
		$(allElements[i]).css('width',   Math.round(parseInt($(allElements[i]).css('width'))*scalingFactor));
	}
	currentCanvasHeight=parseInt(rootDivDom.height());
}

function alwaysRescaleRects(){
	rescalingRects("slideRect", "slideRectTag");
	currentCanvasHeight=parseInt(rootDivDom.height());

	//tagFontSize = currentCanvasHeight*tagFontSizeFactor;
	//tagOffsetTop = tagFontSize+4;

	min_height_rect_abs=currentCanvasHeight*min_height_rect_rel;
	max_height_rect_abs=currentCanvasHeight*max_height_rect_rel;
	min_width_rect_abs=currentCanvasHeight*min_width_rect_rel;
	max_width_rect_abs=currentCanvasHeight*max_width_rect_rel;
}

function loadRect(relLeft, relTop, relWidth, relHeight, color, tagname, canMove){
	//creating Div with default values
	element = $('<div/>', {
		movable: "",
		"can-move": canMove,
		id: rectPrefix+divCounter,
		position: 'absolute',
		class: 'slideRect debug',
		opacity: opacityFactorHighlight
	});
//CHANGE LATER
	element.css({
		position: 'absolute',
		backgroundColor: getCurrentTagColor(),
		borderRadius: bWidth+"px solid #C1E0FF",
	});

	//tag
	element.attr("data-tagName","#"+tagname);



	//transition //CHECK IF THIS LINES ARE CORRECT
	element.prop("-moz-transition", "opacity 0.1s linear");
	element.prop("-ms-transition", "opacity 0.1s linear");
	element.prop("-o-transition", "opacity 0.1s linear");
	element.prop("transition", "opacity 0.1s linear");




	var currCanWidth = rootDivDom.width();

	var attrRelLeft = relLeft*currCanWidth;
	var currCanHeight =rootDivDom.height();
	var attrRelTop  = relTop* currCanHeight;
	element.attr("data-relstartcoord",(attrRelLeft+";"+attrRelTop));
	element.offset({left: absToViewLeft(attrRelLeft, this)});
	element.offset({top: absToViewLeft(attrRelTop, this)});
	element.css('height',  currCanHeight*relHeight);
	element.css('width',   currCanWidth*relWidth);
	element.css('opacity', opacityFactor)

	element = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(element);

	element.appendTo('#annotationZone');
	divCounter=divCounter+1;

	return element;


}



//console.log("test: "+rootDivDom.height());
initRects();

window.onresize = function(){
  		alwaysRescaleRects();
}
