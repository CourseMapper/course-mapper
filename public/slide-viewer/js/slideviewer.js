//var express = require('express');
//var config = require('config');
//var appRoot = require('app-root-path');
//var SlideViewer = require(appRoot + '/modules/slide-viewer');


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
        var isAdmin =  angular.element($("#annZoneList")).scope().$root.user.role == "admin";
        var allowedToEdit = (isAdmin || isAuthor);

        loadRect(toDrawAnnotationZoneData[i].relPosX, toDrawAnnotationZoneData[i].relPosY, toDrawAnnotationZoneData[i].relWidth, toDrawAnnotationZoneData[i].relHeight, toDrawAnnotationZoneData[i].color, toDrawAnnotationZoneData[i].name, false, allowedToEdit, toDrawAnnotationZoneData[i].id)
      }
  }
};

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


function createMovableAnnZone() {
  var element = loadRect(0, 0, 0.3, 0.3, "ac725e", "", true, false, "");
  addAnnotationZoneElement(element);
  var annZoneId = element.attr('id');

  angular.element($("#annZoneList")).scope().tagNamesList[annZoneId] = "";
};


function displayDebug() {
  //console.log("TAGNAMELIST: "+ angular.element($("#annZoneList")).scope().tagNames);
  ;
}
