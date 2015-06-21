var AnnotationsPDF = require('./')
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');

function comment(){
}

comment.prototype.sumbitAnnotation = function(err, params, done){
  var self = this;

  var annPDF = new AnnotationsPDF({
    rawText: params.rawText,
    author: params.author,
    originSlide: params.originSlide,
  });

  // save it to db
  user.save(function (err) {
      if (err) {
          console.log('annotation submitting error');
          // call error callback
          errorCallback(err);
      } else {
          // call success callback
          done(annPDF);

      }
  });
};






module.exports = comment;
