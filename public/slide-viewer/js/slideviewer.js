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

function tagListLoaded(tagList) {
    for(var i = 0; i < tagList.length; i++) {
      createAnnoationZone(tagList[i].name, tagList[i].relPosX, tagList[i].relPosY, tagList[i].relWidth, tagList[i].relHeight, tagList[i].color);
    }
};

function createAnnoationZone(name,relPosX,relPosY,relWidth,relHeight,color) {
  console.log("THEORETICAL TAG CREATED");
};

function addAnnotationZoneData(name,relPosX,relPosY,relWidth,relHeight,color) {
  console.log("GOT CALLED");
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
