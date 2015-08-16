var AnnotationsPDF = require('./annotation')
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');
var AnnZones = require('../annotationZones/index');

function Comment(){
}

Comment.prototype.submitAnnotation = function(err, params, done){
  var temp = this.convertRawText;

  this.submitAllTags(err,params.tags,function(){
    console.log("GOT TO THE END");
    temp(params.rawText,function(renderedText){
      var annotationsPDF = new AnnotationsPDF({
        rawText: params.rawText,
        renderedText: renderedText,
        author: params.author,
        originSlide: params.originSlide
      });

      //console.log(this.convertRawText(params.rawText));


      // save it to db
      annotationsPDF.save(function (err) {
          if (err) {
              console.log('annotation submitting error');
              // call error callback
              console.log(err);
              //errorCallback(err);
          } else {
              // call success callback

              done(annotationsPDF);

          }
      });
    });
  });
};

Comment.prototype.submitAllTags = function(err,tags,callback){
  var annZone = new AnnZones();
  var tagList = tags.split(",");
  console.log(tagList);
  annZone.submitTagList(err,tagList,callback);
}



//TODO Really check if tag name exists
Comment.prototype.checkTagName = function(tagName,tagNameList){
//    var annZone = new AnnZones();
//    return annZone.annotationZoneNameExists(tagName);
  for(var i = 0; i < tagNameList.length; i++){
    if(tagName == tagNameList[i])
      return true;
  }
  return false;

}

Comment.prototype.getAllTagNames = function(callback){
    var annZone = new AnnZones();
    annZone.getAllAnnotationZoneNames(callback);
}


//TODO Not working correctly yet
Comment.prototype.convertRawText = function(rawText,callback){


  var check = this.checkTagName;

  var comm = new Comment();
  comm.getAllTagNames(function(data){

  var tagNameList = [];

  for(var i = 0; i < data.length; i++){
    tagNameList[i] = data[i].annotationZoneName;
  }

  var renderedText = rawText.replace(/#(\w+)/g, function(x){
      var comm = new Comment();
      console.log(comm.checkTagName(x,tagNameList));
      if(comm.checkTagName(x,tagNameList)){
        console.log("ADDED LABEL");
        var ret = "<label class='blueText'> " + x + " </label>";
        return ret;
      }
      else {
        return x;
      }

  });

  callback(renderedText);
  });
  /*var tagArray = [];
  var arrayIndex = 0;

  rawText.replace(/#(\w+)/g, function(x){
        tagArray[arrayIndex] = x;
        arrayIndex = arrayIndex + 1;
        return x;
      }
    }
  )

  check(tagArray, function(foundArray){

  });


  var ret = "<label class='blueText'> " + x + " </label>";
*/
};



Comment.prototype.handleSubmitPost = function(req, res, next) {
    //console.log(req);
    this.submitAnnotation(
        function error(err){
            return next(err);
        },
        req.body,
        function done(annotationsPDF) {
            // todo: implement flash
            return res.redirect('/slide-viewer/');
            // todo: implement redirect to previous screen.
        }
    );
};

Comment.prototype.numberOfComments = function(callback) {
    var numComments = 0;
    AnnotationsPDF.count({

    }, function (err, count) {
      if(err) {
        console.log(err);
      }
      else {
        callback(0, count);
      }

    });
};

Comment.prototype.getAllComments = function(callback) {
    AnnotationsPDF.find({

    }, function (err, data) {
      if(err) {
        console.log(err);
      }
      else {
        callback(0, data);
      }

    });
};

Comment.prototype.getOrderedFilteredComments = function(order,filters,callback) {

    var orderString= ""+order.type;;
    if(order.ascending == "false")
    {
      //console.log("inside if");
      orderString = "-"+orderString;
    }

    console.log(filters);

    AnnotationsPDF.find(filters, function (err, data) {
      if(err) {
        console.log(err);
      }
    }).sort(orderString).exec(function (err, data) {
      if(err) {
        console.log(err);
      }
      else {
        callback(0, data);
      }

    });


};




module.exports = Comment;
