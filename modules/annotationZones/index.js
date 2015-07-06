var AnnotationZonesPDF = require('./annotationZones')
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');

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

AnnZones.prototype.annotationZoneNameExists = function(name) {
    //console.log("REACHED FUNCTION");
    return AnnotationZonesPDF.count({"annotationZoneName": name});

    /*.exec(function (err, data) {
      console.log("REACHED INSIDE");
      if(err) {
        console.log(ERROR);
        return next(err);
      }
      else {
        if(data != 0)
          callback(true);
        else
          callback(false);
      }
    });*/
};




module.exports = AnnZones;
