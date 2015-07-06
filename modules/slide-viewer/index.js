var AnnotationsPDF = require('./annotation')
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');
var AnnZones = require('../annotationZones/index');

function Comment(){
}

Comment.prototype.sumbitAnnotation = function(err, params, done){
  var annotationsPDF = new AnnotationsPDF({
    rawText: params.rawText,
    renderedText: this.convertRawText(params.rawText),
    author: params.author,
    originSlide: params.originSlide,
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
};

//TODO Really check if tag name exists
Comment.prototype.checkTagName = function(tagName){
    var annZone = new AnnZones();
    return annZone.annotationZoneNameExists(tagName);


}

//TODO Not working correctly yet
Comment.prototype.convertRawText = function(rawText){
  var check = this.checkTagName;


  var renderedText = rawText.replace(/#(\w+)/g, function(x){
      console.log(check(x));
      if(check(x)){

        //console.log("ADDED LABEL");
        var ret = "<label class='blueText'> " + x + " </label>";
        return ret;
      }
      else {
        return x;
      }

    }

  )

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
  return renderedText;
}



Comment.prototype.handleSubmitPost = function(req, res, next) {
    //console.log(req);
    this.sumbitAnnotation(
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

    //console.log(orderString);

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
