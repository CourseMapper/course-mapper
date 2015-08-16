var AnnotationZonesPDF = require('./annotationZones')
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');
var async = require('asyncawait/async');
var foreach = require('async-foreach').forEach;
var await = require('asyncawait/await');



function AnnZones(){
}

AnnZones.prototype.submitAnnotationZone = function(err, params, done){
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

function temp(item, done) {
  console.log("Got at least here");
  console.log(item);
  var annotationZonePDF = new AnnotationZonesPDF({
    annotationZoneName: item,
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
          console.log("Got here");
          done();
      }
  });
}



var permArray;

AnnZones.prototype.submitTagList = function(err,tagList, callback){
  if(tagList>=1){
    temp(tagList[0],this.submitTagList(err,tagList.slice(1,(tagList.length-1),callback)));
  }
  else {
    temp(tagList[0],callback);
  }

};

/*AnnZones.prototype.submitTagList = function(err,tagList, callback){

  console.log("got here1");

  console.log(temp);
  console.log(foreach);
  console.log(callback);


  var asy = async( function(){
    for(var i = 0; i < tagList.length; i++)
      await (temp(tagList[i],i));
    return;
  });

  asy().then(callback());
  //foreach(tagList,temp,callback());
  //console.log("got here3");

};*/


AnnZones.prototype.handleZoneSubmitPost = function(req, res, next) {
    //console.log(req);
    this.submitAnnotationZone(
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
  this.getAllAnnotationZones(callback); //TODO fuse
};

AnnZones.prototype.getAllAnnotationZones = function(callback) {
  AnnotationZonesPDF.find({},function (err, data) {
    if(err) {
      console.log(err);
    }
    else {
      console.log(data);
      callback(0, data);
    }
  });
};

module.exports = AnnZones;
