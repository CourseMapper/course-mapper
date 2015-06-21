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
			width: '100px',
			height: '100px',
			opacity: opacityFactorHighlight
		});
		element.css({
			left:150,
			top: 150,
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
