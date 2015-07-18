var AnnotationZonesPDF = require('./annotationZones')
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');
var async = require('asyncawait/async');
var await = require('asyncawait/await');


function AnnZones(){
}

AnnZones.prototype.sumbitAnnotationZone = function(err, params, done){
  var annotationZonePDF = new AnnotationZonesPDF({
    annotationZoneName: params.annotationZoneName,
  });

  // save it to db
  annotationZonePDF.save(function (err) {
      if (err) {
          console.log('annotation submitting error');
          // call error callback
          console.log(err);
          //errorCallback(err);
      } else {
          // call success callback

          done(annotationZonePDF);
      }
  });
};


AnnZones.prototype.handleZoneSubmitPost = function(req, res, next) {
    //console.log(req);
    this.sumbitAnnotationZone(
        function error(err){
            return next(err);
        },
        req.body,
        function done(annotationZonePDF) {
            return res.redirect('/slide-viewer/');
            // todo: implement redirect to previous screen.
        }
    );
};

AnnZones.prototype.annotationZoneNameExists = async(function(name) {

      var count = await (AnnotationZonesPDF.count({"annotationZoneName": name}));
      console.log(count != 0);
      return (count != 0);
});

AnnZones.prototype.getAllAnnotationZoneNames = function(callback) {
  AnnotationZonesPDF.find({},function (err, data) {
    if(err) {
      console.log(err);
    }
    else {
      callback(data);
    }
  });
};


module.exports = AnnZones;
