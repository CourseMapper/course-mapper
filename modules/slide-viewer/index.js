var AnnotationsPDF = require('./annotation')
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');

function comment(){
}

comment.prototype.sumbitAnnotation = function(err, params, done){
  console.log(params);

  //var self = this;

  var annotationsPDF = new AnnotationsPDF({
    rawText: params.rawText,
    author: params.author,
    originSlide: params.originSlide,
  });
  console.log('Step2');

  // save it to db
  annotationsPDF.save(function (err) {
      if (err) {
          console.log('annotation submitting error');
          // call error callback
          console.log(err);
          //errorCallback(err);
      } else {
          // call success callback
          console.log('Step3');

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




module.exports = comment;
