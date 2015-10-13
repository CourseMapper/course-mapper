//var express = require('express');
//var config = require('config');
//var appRoot = require('app-root-path');
//var SlideViewer = require(appRoot + '/modules/slide-viewer');


/*function _init(){
    console.log("WORKED3");

    $("numComments").on("click", function(event) {
      console.log("WORKED2");

    });
};
*/
//console.log("LOADED RESET");
//var pdfIsLoaded = false; // moved to controller
var annotationZonesAreLoaded = false;

var toDrawAnnotationZoneData = [];

//var commentsFullyLoaded = false;


function commentsLoaded(){
  //if(commentsFullyLoaded)
  //  return;
  //commentsFullyLoaded = true;
  var element = $("#commentList .annotationZoneReference").not('.hasOnClick');
  if($("#commentList .annotationZoneReference").not('.hasOnClick').length != 0) {
    //console.log("ADDED CLICK FUNCTION");
    //console.log($("#commentList .annotationZoneReference").length);
    $("#commentList .annotationZoneReference").not('.hasOnClick').click(function(){
      //console.log("TEST:");
      switchRegexFilter("renderedText",$(this).html());
    });
    $("#commentList .annotationZoneReference").not('.hasOnClick').addClass("hasOnClick");

    element.hover(function(){
      var rectId = $(this).html();
      $("#annotationZone [data-tagName='"+rectId+"']").stop().fadeTo("fast", opacityFactorHighlight);
			//$(this).find(".slideRectSpan").stop().fadeTo("fast",1.0); //can be deleted because parent inherit its opacity
		}, function(){
      var rectId = $(this).html();
      $("#annotationZone [data-tagName='"+rectId+"']").stop().fadeTo("fast",opacityFactor);
			//$(this).find(".slideRectSpan").stop().fadeTo("fast",opacityFactor);//can be deleted because parent inherit its opacity
		});

  }
};



/*$(document).ready(function(){
  console.log("Init");
  pdfIsLoaded = false;
  annotationZonesAreLoaded = false;
  toDrawAnnotationZoneData = [];
});
*/

function tagListLoaded(tagList) {
  //console.log("RUN TAGLISTLOADED");
  for(var i = 0; i < tagList.length; i++) {
    //toDrawAnnotationZoneData[i] = [tagList[i].name, tagList[i].relPosX, tagList[i].relPosY, tagList[i].relWidth, tagList[i].relHeight, tagList[i].color];
    toDrawAnnotationZoneData[i] = tagList[i];
  }
  //console.log("ANNZONES LOADED");
  annotationZonesAreLoaded = true;
  drawAnnZonesWhenPDFAndDBDone();
};



function drawAnnZonesWhenPDFAndDBDone() {
  //console.log(annotationZonesAreLoaded);
  //console.log(pdfIsLoaded);
  if(annotationZonesAreLoaded) {
      for(var i = 0; i < toDrawAnnotationZoneData.length; i++) {
        //console.log("createAnnotationZones");
        var isAuthor = (toDrawAnnotationZoneData[i].author == angular.element($("#annZoneList")).scope().currentUser.username);
        loadRect(toDrawAnnotationZoneData[i].relPosX, toDrawAnnotationZoneData[i].relPosY, toDrawAnnotationZoneData[i].relWidth, toDrawAnnotationZoneData[i].relHeight, toDrawAnnotationZoneData[i].color, toDrawAnnotationZoneData[i].name, false, isAuthor, toDrawAnnotationZoneData[i].id)
      }

  }
};

/*function removeAnnotationZone(id) {
  var element = $("#annotationZone #"+id);

  var annotationInList = $("#annotationZoneSubmitList div").find("#"+id);

  //console.log("Will remove " +  annotationInList.length + " elements with id " + id);
  var inputId = element.attr("id");
  console.log(angular.element($("#annZoneList")).scope().tagNamesList);
  console.log(angular.element($("#annZoneList")).scope().tagNamesList[inputId]);
  console.log(inputId);
  delete angular.element($("#annZoneList")).scope().tagNamesList[inputId];
  angular.element($("#annZoneList")).scope().timeout();

  annotationInList.parent().remove();
  element.remove();

  /*var element = $(childElement).parent();
  var rectId = element.find("#rectangleId").val();
  var rectElement = $("#"+rectId);
  rectElement.remove();
  element.remove();*/

//};

function addAnnotationZoneElement(element) {

  var htmlTemplate = $("#annotationZoneSubmitTemplate").html();
  var elementField = "<input id='rectangleId' type='hidden' value='" + element.attr('id') + "'>";
  var nameInputField = '<input id="annotationZoneSubmitName" ng-model="storedAnnZones[\'' + element.attr('id') +  '\']" placeholder="Enter annotation zone name">';
  //var nameInputField = '<input id="annotationZoneSubmitName" placeholder="Enter annotation zone name">';
  //var colorSelectField = '<select id="annotationZoneSubmitColor"  ng-model="storedAnnZoneColors[\'' + element.attr('id') +  '\']"><option selected value="Red">Red</option><option value="Blue">Blue</option><option value="Green">Green</option></select>';
  var colorSelectField = '<select id="annotationZoneSubmitColor"><option selected value="Red">Red</option><option value="Blue">Blue</option><option value="Green">Green</option></select>';


  //annotationHtmlString = "<div>" + elementField + nameInputField + colorSelectField + htmlTemplate + "</div>";
  annotationHtmlString = "<div>" + elementField + "</div>";


  var element = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(annotationHtmlString);

  $("#annotationZoneSubmitList").append(element);

};
/* moved to commentlistcontroller
function commentOnSubmit() {
  //console.log("IT WOKRS");


  $("#tagNames").val("");
  $("#tagRelPos").val("");
  $("#tagRelCoord").val("");
  $("#tagColor").val("");

  annotationList = $("#annotationZoneSubmitList div");

  //console.log(annotationList);

  for(var i = 0; i < annotationList.length; i++) {
    //console.log("added tag");
    //TODO: Adapt to next rectangle iteration
    var elementId = $("#annotationZoneSubmitList #rectangleId").eq(i).val();
    var element = $("#"+elementId);
    var relPosX = element.position().left/$('#annotationZone').width();
  	var relPosY = element.position().top/ $('#annotationZone').height();
  	var relWidth = element.width()/$('#annotationZone').width();
  	var relHeight = element.height()/$('#annotationZone').height();

    var name = element.find(".slideRectInput").val();
    //console.log("Name found: "+element.find(".slideRectInput").length);
    //var name = $("#annotationZoneSubmitList #annotationZoneSubmitName").eq(i).val();
    var color = element.find(".pick-a-color").val();
    //console.log("Color found: "+color);
    //var color = $("#annotationZoneSubmitList #annotationZoneSubmitColor").eq(i).val();

    if(name == "") {
      //console.log("Error encountered while extracting annotation zone during submission.");
      return false;
    }
    else {
      addAnnotationZoneData("#" + name,relPosX,relPosY,relWidth,relHeight,color);
    }
  }


  //TODO: Check integrity of the input
  //console.log("got here");
  return true;
};

 moved to commentlistcontroller
function addAnnotationZoneData(name,relPosX,relPosY,relWidth,relHeight,color) {
  var oldText;
  oldText = $("#tagNames").val();
  if(oldText.length != 0){
    oldText = oldText + ",";
  }
  $("#tagNames").val(oldText + "" + name);
  oldText = $("#tagRelPos").val();
  if(oldText.length != 0){
    oldText = oldText + ",";
  }
  $("#tagRelPos").val(oldText + "" + relPosX + ";" + relPosY);
  oldText = $("#tagRelCoord").val();
  if(oldText.length != 0){
    oldText = oldText + ",";
  }
  $("#tagRelCoord").val(oldText + "" + relWidth + ";" + relHeight);
  oldText = $("#tagColor").val();
  if(oldText.length != 0){
    oldText = oldText + ",";
  }
  $("#tagColor").val(oldText + "" + color);

};*/

/*
used by displayComments only, which is not being called anywhere
function displayCommentsIntern(filter, order){

    var url = "/slide-viewer/disComm";
    var urlFilterOrder = url + "/" + order + "/" + filter;

    /!*$.ajax( {
      "url": urlFilterOrder,
      //"async": false,
      "dataType": "html",
      "success": function (html) {
        $("#showComments").html(html);
        $(".commentText").each(function(index){
          $(this).html($(this).text());
        });
      }

    } );*!/
};*/

/*
not being called anywhere
function displayComments(){

  var fType = $("#filterTypeSelect").val();
  var fValue = $("#filterValueText").val();
  var oType = $("#orderTypeSelect").val();
  var oAsc = $("#orderAscendingSelect").val();


  var filter = '{}';
  if(fType != "none")
    filter='{"' + fType + '":"' + fValue + '"}';
  var order= '{"type": "' + oType + '","ascending": "' + oAsc + '"}';
  filter = JSON.parse(filter);
  order = JSON.parse(order);
  displayCommentsIntern(JSON.stringify(filter),JSON.stringify(order));
};*/

/*
already moved to controller
function authorLabelClick(element){
  var filterInput = $('#filterValueText');
  var authorName = element.text();

  if (filterInput.val().length == 0){
    filterInput.val('author,' + authorName + '');
  }
  else {
    filterInput.val('');
  }
  filterInput.trigger('input');



};*/

/*
moved to controller
function switchRegexFilter(attribute,value){
  var filterInput = $('#filterValueText');

  if (filterInput.val().length == 0){
    filterInput.val(attribute + ':' + value + '');
  }
  else {
    filterInput.val('');
  }
  filterInput.trigger('input');
};*/

function createMovableAnnZone() {
  var element = loadRect(0, 0, 0.3, 0.3, "ac725e", "", true, false, "");
  addAnnotationZoneElement(element);
};

/*
moved to controller, and used model
function switchCommentSubmissionDisplay() {
  var div = $("#commentSubmissionDiv");
  if(div.is(':visible'))
    div.hide();
  else {
    div.show();
  }
}
*/

function displayDebug() {
  //console.log("TAGNAMELIST: "+ angular.element($("#annZoneList")).scope().tagNames);
  ;
}
