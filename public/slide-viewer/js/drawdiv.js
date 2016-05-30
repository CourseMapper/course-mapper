/*
 drawdiv.js is able to draw as many divs as you want inside an other div.
 If you want to change the rootdiv, just call changeRootDiv(newRootDiv).
 */
//settings
var rootDivId = 'annotationZone';
var currentCanvasHeight = 0;
var min_height_rect_rel = 0.06;
var max_height_rect_rel = 0.55;
var min_width_rect_rel = 0.06;
var max_width_rect_rel = 0.75;

var min_height_rect_abs = 50;
var max_height_rect_abs = 300;
var min_width_rect_abs = 50;
var max_width_rect_abs = 300;


var rectPrefix = "rect-";
var rectSpanPrefix = "rectspan-";
var divCounter = 0;
var drag = false;

var startXRel;
var startYRel;


var opacityFactor = "0.125";
var opacityFactorHighlight = "0.75";
var opacityFactorCreate = "0.75"

//Random Values
var tagFontSize = 1;
var tagIffsetTop = 4;

var currentTagName = "";
var currentTagColor = "#1E90FF";

var bWidth = "3";
var bRadius = "4";

function absToViewTop(relToView, canvas) {
    //console.log(rootDivDom.offset().top);
    return $('#annotationZone').offset().top + parseInt(relToView, 10);
}
function absToViewLeft(relToView, canvas) {
    //console.log("CHECK: "+ relToView);
    return $('#annotationZone').offset().left + parseInt(relToView, 10);
}

function getCurrentTagName() {
    return currentTagName;
}

function setCurrentTagName(tTagName) {
    currentTagName = tTagName;
}
function getCurrentTagColor() {
    return currentTagColor;
}
function setCurrentTagColor(tTagColor) {
    currentTagColor = tTagColor;
}

function initRects() {
    //$('#annotationZone').bind('mousedown', mouseDown);
    //$('#annotationZone').bind('mouseup', mouseUp);
    //$('#annotationZone').bind('mousemove', mouseMove);
    //$('#annotationZone').bind('mouseleave', mouseLeave);
}
function appendClickEventOnRect() {
    /*$(".slideRect").each(function () {
        $(this).click(function () {
            var text = $(".activeTextArea").val();
            if (text.slice(-1) == " ") {
                $(".activeTextArea").val(text + $(this).attr("data-tagName"));
            } else {
                $(".activeTextArea").val(text + " " + $(this).attr("data-tagName"));
            }

        });
    });
    */
}

function mouseDown(e) {
    if (e.which != 3) {
        if (e.pageX - $('#annotationZone').offset().left > (min_width_rect_abs / 2)) {
            if (e.pageX - $('#annotationZone').offset().left < parseInt($('#annotationZone').width()) - (min_width_rect_abs / 2)) {
                startXRel = e.pageX - $('#annotationZone').offset().left - (min_width_rect_abs / 2);
            } else {
                startXRel = parseInt($('#annotationZone').width()) - min_width_rect_abs;
            }
        } else {
            startXRel = 0;
        }
        if (e.pageY - $('#annotationZone').offset().top > (min_height_rect_abs / 2)) {
            if (e.pageY - $('#annotationZone').offset().top < parseInt($('#annotationZone').height()) - (min_height_rect_abs / 2)) {
                startYRel = e.pageY - $('#annotationZone').offset().top - (min_height_rect_abs / 2);
            } else {
                startYRel = parseInt($('#annotationZone').height()) - min_height_rect_abs;
            }
        } else {
            startYRel = 0;
        }


        //creating Div with default values
        element = $('<div/>', {
            id: rectPrefix + divCounter,
            position: 'relative',
            class: 'slideRect debug',
            opacity: opacityFactorHighlight
        });
        //CHANGE LATER
        element.css({
            position: 'absolute',
            backgroundColor: getCurrentTagColor(),
            borderRadius: bWidth + "px solid #C1E0FF",
        });


        //tag
        element.attr("data-tagName", "#" + getCurrentTagName());

        //setting drawed div on activeRects
        element.className = element.className + " activeRect tagname-" + element.attr("data-tagName").slice(1);


        //transition //CHECK IF THIS LINES ARE CORRECT
        element.prop("-moz-transition", "opacity 0.1s linear");
        element.prop("-ms-transition", "opacity 0.1s linear");
        element.prop("-o-transition", "opacity 0.1s linear");
        element.prop("transition", "opacity 0.1s linear");


        element.attr("data-relstartcoord", (startXRel + ";" + startYRel));


        element.offset({left: absToViewLeft(startXRel, this)});
        element.offset({top: absToViewLeft(startYRel, this)});
        element.width(min_width_rect_abs);
        element.height(min_height_rect_abs);
        element.appendTo('#annotationZone');


        appendClickEventOnRect();
        drag = true;
    }

}

function mouseUp(e) {
    element.appendTo('#annotationZone');
    /*elementTag.style.opacity = 0;
     if(animation){
     var tl = new TimelineMax();
     tl.append(TweenMax.fromTo("#"+element.id,.15, {scale:1.02}, {css:{scale:1}, ease:Quad.easeIn}));
     oTransitionRect(element.id,"tagname-"+element.getAttribute("data-tagName").slice(1), opacityFactor, opacityFactorHighlight);
     }
     canvas.style.cursor = "default";*/
    divCounter = divCounter + 1;
    drag = false;


    addAnnotationZoneElement(element);
}

function mouseMove(e) {
    if (drag) {
        var currentX = e.pageX - $('#annotationZone').offset().left;
        var currentY = e.pageY - $('#annotationZone').offset().top;
        var divWidth = currentX - startXRel;
        var divHeight = currentY - startYRel;
        var relSaveX = 0;
        var relSaveY = 0;


        if (currentX - startXRel < 0) {
            if ((max_width_rect_abs - min_width_rect_abs) < Math.abs(currentX - startXRel)) {
                relSaveX = startXRel - (max_width_rect_abs - min_width_rect_abs);
                element.offset({left: $('#annotationZone').offset().left + relSaveX});
                //elementTag.style.left = this.offsetLeft + relSaveX +tagOffsetLeft+ 'px';
                divWidth = max_width_rect_abs;
            } else {
                relSaveX = currentX;
                element.offset({left: $('#annotationZone').offset().left + relSaveX});
                //elementTag.style.left = this.offsetLeft + relSaveX +tagOffsetLeft+ 'px';
                divWidth = Math.abs(currentX - startXRel) + min_width_rect_abs;
            }
        } else {
            if ((currentX - startXRel) < min_width_rect_abs) {
                relSaveX = startXRel;
                element.offset({left: $('#annotationZone').offset().left + relSaveX});
                //elementTag.style.left =this.offsetLeft+relSaveX +tagOffsetLeft+ 'px';
                divWidth = min_width_rect_abs;
            } else {
                relSaveX = startXRel;
                element.offset({left: $('#annotationZone').offset().left + relSaveX});
                //elementTag.style.left = this.offsetLeft+relSaveX+tagOffsetLeft + 'px';
                if ((currentX - startXRel) > max_width_rect_abs) {
                    divWidth = max_width_rect_abs;
                } else {
                    divWidth = currentX - startXRel;
                }
            }

        }
        element.width(Math.abs(divWidth));

        if (currentY - startYRel < 0) {
            if ((max_height_rect_abs - min_height_rect_abs) < Math.abs(currentY - startYRel)) {
                relSaveY = startYRel - (max_height_rect_abs - min_height_rect_abs);
                element.offset({top: $('#annotationZone').offset().top + relSaveY});
                //elementTag.style.top = this.offsetTop + relSaveY -tagOffsetTop + 'px';
                divHeight = max_height_rect_abs;
            } else {
                relSaveY = currentY;
                element.offset({top: $('#annotationZone').offset().top + relSaveY});
                //elementTag.style.top = this.offsetTop + relSaveY -tagOffsetTop + 'px';

                divHeight = Math.abs(currentY - startYRel) + min_height_rect_abs;
            }
        } else {
            if ((currentY - startYRel) < min_height_rect_abs) {
                relSaveY = startYRel;
                element.offset({top: startYRel + $('#annotationZone').offset().top});
                //elementTag.style.top =this.offsetTop+ relSaveY -tagOffsetTop + 'px';
                divHeight = min_height_rect_abs;
            } else {
                relSaveY = startYRel;

                element.offset({top: $('#annotationZone').offset().top + relSaveY});
                //elementTag.style.top = this.offsetTop+relSaveY-tagOffsetTop + 'px';
                if ((currentY - startYRel) > max_height_rect_abs) {
                    divHeight = max_height_rect_abs;
                } else {
                    divHeight = currentY - startYRel;
                }
            }

        }
        element.height(Math.abs(divHeight));

        element.attr("data-relwidthheight", Math.abs(divWidth) + ";" + Math.abs(divHeight));
        element.attr("data-relstartcoord", relSaveX + ";" + relSaveY);
    }

}

function mouseLeave(e) {
    if (drag) {
        mouseleftCanvas = true;
    }
}

function setCurrentCanvasHeight(value){
  currentCanvasHeight = value;
}

function rescalingRects(rectClassName, tagClassName) {
    var allElements = $("." + rectClassName);
    var scalingFactor = parseInt($('#annotationZone').height()) / currentCanvasHeight;
    //console.log("height "+ $('#annotationZone').height() + " currentCanvasHeight"+ currentCanvasHeight)
    /*var allElementsTag = $("."+tagClassName);
     tagFontSize = parseInt($('#annotationZone').height())*tagFontSizeFactor;*/
    tagOffsetTop = tagFontSize + 4;
    //console.log("Scaling factor: "+scalingFactor);

    for (var i = 0, len = allElements.length; i < len; i++) {
        var coordAttr;
        var startXAttr;
        var startYAttr;
        if($(allElements[i]).attr("can-move")=="true"){
          //coordAttr[0]=$(allElements[i]).position().top;
          startYAttr=parseInt($(allElements[i]).css("top"))* scalingFactor;
          startXAttr=parseInt($(allElements[i]).css("left"))* scalingFactor;

        }
        else{
            coordAttr = $(allElements[i]).attr("data-relstartcoord").split(";");
            startXAttr = coordAttr[0] * scalingFactor;
            startYAttr = coordAttr[1] * scalingFactor;
        }

        $(allElements[i]).attr("data-relstartcoord", startXAttr + ";" + startYAttr);
        $(allElements[i]).css('left', Math.round(startXAttr));
        $(allElements[i]).css('top', Math.round(startYAttr));
        $(allElements[i]).css('height', Math.round(parseInt($(allElements[i]).css('height')) * scalingFactor));
        $(allElements[i]).css('width', Math.round(parseInt($(allElements[i]).css('width')) * scalingFactor));
    }
    currentCanvasHeight = parseInt($('#annotationZone').height());
}

function alwaysRescaleRects() {
    rescalingRects("slideRect", "slideRectTag");
    currentCanvasHeight = parseInt($('#annotationZone').height());

    //tagFontSize = currentCanvasHeight*tagFontSizeFactor;
    //tagOffsetTop = tagFontSize+4;

    min_height_rect_abs = currentCanvasHeight * min_height_rect_rel;
    max_height_rect_abs = currentCanvasHeight * max_height_rect_rel;
    min_width_rect_abs = currentCanvasHeight * min_width_rect_rel;
    max_width_rect_abs = currentCanvasHeight * max_width_rect_rel;
}

function loadRect(relLeft, relTop, relWidth, relHeight, color, tagname, canMove, canBeEdited, annZoneId) {
  //canBeEdited=true;
    //if(!canMove){
    switch (color) {
        case "Red":
            color = "#CC0000";
            break;
        case "Blue":
            color = "#1E90FF";
            break;
        case "Green":
            color = "#00FF00";
            break;
        default:
            color = "#" + color;
    }
    //}
    //else {
    //color = "{{storedAnnZoneColors['"+ rectPrefix+divCounter +"']}}";
    //}
    //creating Div with default values
    element = $('<div/>', {
        movable: "",
        //"on-moved" : "annZoneMov["+rectPrefix + divCounter+"].reposition",
        //"ng-style" : "{top: annZoneMov["+rectPrefix + divCounter+"].position.top + '%', left: annZoneMov["+rectPrefix + divCounter+"].position.left + '%', width: annZoneMov["+rectPrefix + divCounter+"].size.width + '%', height: annZoneMov["+rectPrefix + divCounter+"].size.height + '%'}",
        "can-move": canMove,
        "ng-hide": '(switchShowAnnoZones=="Off")',
        id: rectPrefix + divCounter,
        position: 'absolute',
        class: 'slideRect',
        opacity: opacityFactorHighlight
    });


    element.css({
        position: 'absolute',
        backgroundColor: color,
        '-webkit-transition': 'background 0.1s linear',
        '-moz-transition': 'background 0.1s linear',
        '-ms-transition': 'background 0.1s linear',
        '-o-transition': 'background 0.1s linear',
        'transition': 'background 0.1s linear'
    });

    //tag
    element.attr("data-tagName", tagname);

    //transition //CHECK IF THIS LINES ARE CORRECT
    element.prop("-moz-transition", "opacity 0.1s linear");
    element.prop("-ms-transition", "opacity 0.1s linear");
    element.prop("-o-transition", "opacity 0.1s linear");
    element.prop("transition", "opacity 0.1s linear");


    var currCanWidth = $('#annotationZone').width();

    var attrRelLeft = relLeft * currCanWidth;
    var currCanHeight = $('#annotationZone').height();
    var attrRelTop = relTop * currCanHeight;
    element.attr("data-relstartcoord", (attrRelLeft + ";" + attrRelTop));
    element.css({left: (attrRelLeft)});
    element.css({top: (attrRelTop)});
    //element.attr("ng-style", "{left: " + absToViewLeft(attrRelLeft, this) + ",top: " + absToViewLeft(attrRelTop, this) + ",height: " + currCanHeight*relHeight + ",width: " + currCanWidth*relWidth+"}");
    element.css('height', currCanHeight * relHeight);
    element.css('width', currCanWidth * relWidth);

    //clickAreaElement
    caElement =  $('<div/>', {
      id: "caRect-" + divCounter,
      class: 'caRect'
  });
  caElement.css({
    "width": "100%",
    "height": "100%"

  });




  /*editElement.click(function () {
      alert($(this).attr("id"));
  });*/


  var left  = 0,
      top   = 0;
  var mousemovedbool =false

  $(caElement).on({
      mousedown: function(e) {
          left  = e.pageX;
          top   = e.pageY;
      },
      mouseup: function(e) {
          if (left != e.pageX || top != e.pageY) {
              mousemovedbool=true;
          }else{
            mousemovedbool=false;
          }
      }
  });
    if (canMove) {

      //Need to be redone again.
      caElement.click(function(evt) {
          console.log()
          if(!$(evt.target).hasClass('simplecolorpicker')){
            if($('#commentSubmissionDiv').css('display')!='none' && mousemovedbool==false){
              angular.element($("#commentController")).scope().addReference("#"+$(this).find(".slideRectWrapper").find(".slideRectSpan").find(".slideRectInput").val());
            }
          }

          /*
        //check if commentbox is displayed and mouse wasnt move during mousedown event
        if($('#commentSubmissionDiv').css('display')!='none' && mousemovedbool==false){
        //check if entered string is neither empty nor whitespaced
          if(/\S/.test($(this).find(".slideRectWrapper").find(".slideRectSpan").find(".slideRectInput").val())){
            for(i=0; i<Quill.editors.length; i++){
              if(Quill.editors[i].quillId=='#rawText'){
                Quill.editors[i].insertText(Quill.editors[i].getLength()-1, " #"+ $(this).find(".slideRectWrapper").find(".slideRectSpan").find(".slideRectInput").val()+" ", true);
                Quill.editors[i].focus();
              }
            }

          }
        }*/
      });
        element.css('opacity', opacityFactorCreate);
        element.css('border', ' 1px dashed white');
    } else {
      caElement.click(function () {
        angular.element($("#commentController")).scope().addReference(tagname);
        /*if($('#commentSubmissionDiv').css('display')!='none' ){
          for(i=0; i<Quill.editors.length; i++){
              if(Quill.editors[i].quillId=='#rawText'){
              Quill.editors[i].insertText(Quill.editors[i].getLength()-1, " "+ $(this).parent().attr("data-tagName")+" ", true);
              Quill.editors[i].focus();
            }
          }
        }*/
      });
        element.css('opacity', opacityFactor);
        element.hover(function () {
            $(this).stop().fadeTo("fast", opacityFactorHighlight);
        }, function () {
            $(this).stop().fadeTo("fast", opacityFactor);
        });
    }

    //debuggingTextElement
    debuggingTextElement = $('<span/>', {
      id: "debuggingTextElement"+divCounter,
      class: "debuggingTextElement"
    });

    debuggingTextElement.css('color', 'red');
    debuggingTextElement.css('font-size','8pt');

    //Wrapper
    wrapperElement = $('<div/>', {
        id: "slideRectWrapper-" + divCounter,
        class: 'slideRectWrapper'
    });
    wrapperElement.css({
      "padding-bottom": "1px",
      "padding-top": "1px",
    });


    spanElement = $('<span/>', {
        id: rectSpanPrefix + divCounter,
        class: 'slideRectSpan'
    });

    spanElement.css("margin-right", "2pt");

    //inputElement
    if(canMove) {
      inputElement = $('<input type="text"/>');
      inputElement.attr("id", "rectInputField-" + divCounter);
      inputElement.attr("ng-model", "tagNamesList['" + rectPrefix + divCounter + "']");
      inputElement.addClass("slideRectInput");
      inputElement = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(inputElement);

      inputElement.css({
        'color': 'black',
        'transition': 'width 0.25s',
        'border': '0'
      });
      nColorPickerInput = $('<select/>');
      nColorPickerInput.attr("name","colorpicker-change-background-color");
      nColorPickerInput.attr("value","#ac725e");
      nColorPickerInput.append('<option value="#ac725e">#ac725e</option>  <option value="#d06b64">#d06b64</option>  <option value="#f83a22">#f83a22</option>  <option value="#fa573c">#fa573c</option>  <option value="#ff7537">#ff7537</option>  <option value="#ffad46">#ffad46</option>  <option value="#42d692">#42d692</option>  <option value="#16a765">#16a765</option>  <option value="#7bd148">#7bd148</option>  <option value="#b3dc6c">#b3dc6c</option>  <option value="#fbe983">#fbe983</option>  <option value="#fad165">#fad165</option>  <option value="#92e1c0">#92e1c0</option>  <option value="#9fe1e7">#9fe1e7</option>  <option value="#9fc6e7">#9fc6e7</option>  <option value="#4986e7">#4986e7</option>  <option value="#9a9cff">#9a9cff</option>  <option value="#b99aff">#b99aff</option>  <option value="#c2c2c2">#c2c2c2</option>  <option value="#cabdbf">#cabdbf</option>  <option value="#cca6ac">#cca6ac</option>  <option value="#f691b2">#f691b2</option><option value="#cd74e6">#cd74e6</option><option value="#a47ae2">#a47ae2</option>');
      nColorPickerInput.attr("id", "colorPickerInput-" + divCounter);
      nColorPickerInput.addClass("slideRectColorPicker");

	   }
     else if(canBeEdited) {
       var id = annZoneId;
       //console.log(id);
       editInputElement = $('<input type="text"/>');
       editInputElement.attr("id", "rectEditInputField-" + divCounter);
       editInputElement.attr("name", "rectEditInputField-" + divCounter);
       editInputElement.attr("ng-model", "editZoneValues['" + id + "'].name");
       editInputElement.attr("ng-hide", "(editZoneMode != '"+id+"')");
       editInputElement.addClass("slideRectInput");
       //editInputElement = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(editInputElement);

       editInputElement.css({
         'color': 'black',
         'transition': 'width 0.25s',
         'border': '0'
       });




       //angular.element($("#annZoneList")).scope().editZoneValues[id].name = tagname.substring(1);



       //angular.element($("#annZoneList")).scope().editZoneValues[id].color = color;

       angular.element($("#annZoneList")).scope().editZoneValues[id] = {name: tagname.substring(1), color: color};



     }


     editElement = $('<span/>', {
       id: "editSpan-" + divCounter,
       class:'glyphicon glyphicon-pencil',
       "aria-hidden":"true",
       "ng-click": "setEditZoneMode('" + annZoneId + "',"+divCounter+",'"+color+"')",
       "ng-hide": "(editZoneMode == '"+id+"')"
     });
     editElement.css({
         float: "right",
         color: "white",
         margin: "2px",
         cursor: "pointer"
     });

     cancelSaveElement = $('<span/>', {
       id: "saveSpan-" + divCounter,
       class:'glyphicon glyphicon-floppy-remove',
       "aria-hidden":"true",
       "ng-hide": "(editZoneMode != '"+id+"')",
       "ng-click": "resetEditZoneMode()",
     });

     cancelSaveElement.css({
         float: "right",
         color: "white",
         margin: "2px",
         cursor: "pointer"
     });

     saveElement = $('<span/>', {
       id: "saveSpan-" + divCounter,
       class:'glyphicon glyphicon-floppy-saved',
       "aria-hidden":"true",
       "ng-hide": "(editZoneMode != '"+id+"')",
       "ng-click": "updateAnnZone('"+annZoneId+"')"
     });

     saveElement.css({
         float: "right",
         color: "white",
         margin: "2px",
         cursor: "pointer"
     });

     //editElement = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(editElement);




    removeElement = $('<button/>', {
        class: "btn btn-white btn-link",
        "ng-click": "removeAnnotationZone('" + rectPrefix + divCounter + "');",
        text: "X",
    });

    removeElement.css({
        float: "right",
    });

    checkIconElement = $('<span/>');
    checkIconElement.addClass("validationIcon");
    checkIconElement.attr("aria-hidden","true");
    checkIconElement.attr("id","validationIcon-"+divCounter);
    checkIconElement.css({
      color: "white"
    });

    //Add Class for wrong validation
    // glyphicon glyphicon-remove-sign

    //Add Class for right validation
    //glyphicon glyphicon-ok-sign

    hashElement = $("<span/>");
    hashElement.text("#");
    hashElement = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(hashElement);


    tagNameElement = $("<span/>");
    tagNameElement.text(tagname.substring(1));
    tagNameElement.attr("ng-hide", "(editZoneMode == '"+annZoneId+"')");
    tagNameElement = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(tagNameElement);

    if(!canBeEdited && !canMove) {
      spanElement.append(hashElement);
      spanElement.append(tagNameElement);
      //spanElement.append(editInputElement);
      //wrapperElement.append(nColorPickerEditInput);
      //wrapperElement.css({"margin-left":"-20px"});
      wrapperElement.append(spanElement);
    }
    else if (!canMove && canBeEdited) {
        spanElement.append(hashElement);
        spanElement.append(tagNameElement);
        spanElement.append(editInputElement);
        //wrapperElement.append(nColorPickerEditInput);
        //wrapperElement.css({"margin-left":"-20px"});
        wrapperElement.append(spanElement);
        if(canBeEdited){
          wrapperElement.append(editElement);
          wrapperElement.append(cancelSaveElement);
          wrapperElement.append(saveElement);
        }
    }
    else {
        spanElement.text("#");
        spanElement.append(inputElement);
        wrapperElement.append(nColorPickerInput);
        wrapperElement.css({"margin-left":"-20px"});
        wrapperElement.append(spanElement);
        wrapperElement.append(checkIconElement);
        wrapperElement.append(removeElement);

        inputElement.click(function(e) {
            e.stopPropagation();
        });





    }
    //wrapperElement.append(debuggingTextElement);
    caElement.append(wrapperElement);
    element.append(caElement);



    element.appendTo('#annotationZone');

    //colorpicker Stuff
    element = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(element);
    divCounter = divCounter + 1;

    if (canMove) {

      $('select[name="colorpicker-change-background-color"]').simplecolorpicker({picker: true, theme: 'glyphicons'});
      $('#destroy').on('click', function() {
        $('select').simplecolorpicker('destroy');
      });
      // By default, activate simplecolorpicker plugin on HTML selects
      $('#init').trigger('click');


      nColorPickerInput.on('change', function() {
          $(this).parent().parent().parent().css('background-color', $(this).val());
          $(this).attr("value",$(this).val());

        });
      }




    return element;
}

$(document).ready(function () {
  initRects();

  window.onresize = function () {
      alwaysRescaleRects();
  }
});
