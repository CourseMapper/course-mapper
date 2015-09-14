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
var pdfIsLoaded = false;
var annotationZonesAreLoaded = false;

var toDrawAnnotationZoneData = [];

//var commentsFullyLoaded = false;


function commentsLoaded(){
  //if(commentsFullyLoaded)
  //  return;
  //commentsFullyLoaded = true;
  if($("#commentList .annotationZoneReference").not('.hasOnClick').length != 0) {
    //console.log("ADDED CLICK FUNCTION");
    //console.log($("#commentList .annotationZoneReference").length);
    $("#commentList .annotationZoneReference").not('.hasOnClick').click(function(){
      //console.log("TEST:");
      switchRegexFilter("renderedText",$(this).html());
    });
    $("#commentList .annotationZoneReference").not('.hasOnClick').addClass("hasOnClick");

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
    toDrawAnnotationZoneData[i] = [tagList[i].name, tagList[i].relPosX, tagList[i].relPosY, tagList[i].relWidth, tagList[i].relHeight, tagList[i].color];
  }
  //console.log("ANNZONES LOADED");
  annotationZonesAreLoaded = true;
  drawAnnZonesWhenPDFAndDBDone();
};

/*function createAnnoationZone(name,relPosX,relPosY,relWidth,relHeight,color) {
  console.log("createAnnotationZones");
  console.log("name: "+name+" relPosX: "+relPosX+" relPosY: "+ relPosY+" relWidth: "+relWidth+ " relHeight: "+relHeight+" color: "+color);
  loadRect(relPosX, relPosY, relWidth, relHeight, color, name)
};*/

function drawAnnZonesWhenPDFAndDBDone() {
  //console.log(annotationZonesAreLoaded);
  //console.log(pdfIsLoaded);
  if(annotationZonesAreLoaded && pdfIsLoaded) {
    for(var i = 0; i < toDrawAnnotationZoneData.length; i++) {
      //console.log("createAnnotationZones");
      loadRect(toDrawAnnotationZoneData[i][1], toDrawAnnotationZoneData[i][2], toDrawAnnotationZoneData[i][3], toDrawAnnotationZoneData[i][4], toDrawAnnotationZoneData[i][5], toDrawAnnotationZoneData[i][0], false)
    }
  }
};

function removeAnnotationZone(childElement) {
  var element = $(childElement).parent();
  var rectId = element.find("#rectangleId").val();
  var rectElement = $("#"+rectId);
  rectElement.remove();
  element.remove();
}

function addAnnotationZoneElement(element) {

  var htmlTemplate = $("#annotationZoneSubmitTemplate").html();
  var elementField = "<input id='rectangleId' type='hidden' value='" + element.attr('id') + "'>";
  var nameInputField = '<input id="annotationZoneSubmitName" ng-model="storedAnnZones[\'' + element.attr('id') +  '\']" placeholder="Enter annotation zone name">';
  //var nameInputField = '<input id="annotationZoneSubmitName" placeholder="Enter annotation zone name">';

  annotationHtmlString = "<div>" + elementField + nameInputField + htmlTemplate + "</div>";

  var element = angular.element($("#annZoneList")).scope().compileMovableAnnotationZone(annotationHtmlString);

  $("#annotationZoneSubmitList").append(element);

};

function commentOnSubmit() {
  //console.log("IT WOKRS");


  $("#tagNames").val("");
  $("#tagRelPos").val("");
  $("#tagRelCoord").val("");
  $("#tagColor").val("");

  annotationList = $("#annotationZoneSubmitList div");

  console.log(annotationList);

  for(var i = 0; i < annotationList.length; i++) {
    //console.log("added tag");
    //TODO: Adapt to next rectangle iteration
    var elementId = $("#annotationZoneSubmitList #rectangleId").eq(i).val();
    var element = $("#"+elementId);
    var relPosX = element.position().left/rootDivDom.width();
  	var relPosY = element.position().top/ rootDivDom.height();
  	var relWidth = element.width()/rootDivDom.width();
  	var relHeight = element.height()/rootDivDom.height();

    var name = $("#annotationZoneSubmitList #annotationZoneSubmitName").eq(i).val();
    var color = $("#annotationZoneSubmitList #annotationZoneSubmitColor").eq(i).val();

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

};


function displayCommentsIntern(filter, order){

    var url = "/slide-viewer/disComm";
    var urlFilterOrder = url + "/" + order + "/" + filter;

    /*$.ajax( {
      "url": urlFilterOrder,
      //"async": false,
      "dataType": "html",
      "success": function (html) {
        $("#showComments").html(html);
        $(".commentText").each(function(index){
          $(this).html($(this).text());
        });
      }

    } );*/
};

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
};

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



};

function switchRegexFilter(attribute,value){
  var filterInput = $('#filterValueText');

  if (filterInput.val().length == 0){
    filterInput.val(attribute + ':' + value + '');
  }
  else {
    filterInput.val('');
  }
  filterInput.trigger('input');
};

function createMovableAnnZone() {
  var element = loadRect(0, 0, 0.3, 0.3, "Red", "NoNameYet", true);
  addAnnotationZoneElement(element);
};
