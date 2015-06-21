var AnnotationsPDF = require('./annotation')
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');

function comment(){
}

comment.prototype.sumbitAnnotation = function(err, params, done){
  var annotationsPDF = new AnnotationsPDF({
    rawText: params.rawText,
    author: params.author,
    originSlide: params.originSlide,
  });

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

comment.prototype.handleSubmitPost = function(req, res, next) {
    console.log(req);
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

comment.prototype.numberOfComments = function() {
    var numComments = 0;
    AnnotationsPDF.count({
    }, function (err, count) {
        numComments = count;
    });
    return numComments;
};




module.exports = comment;
