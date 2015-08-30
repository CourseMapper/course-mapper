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
          console.log('annotation submitting error2');
          // call error callback
          console.log(err);
          //errorCallback(err);
      } else {
          // call success callback

          done(annotationZonePDF);
      }
  });
};

function submitSingleTag(tagList, err, restList, mainCallback, done) {
  //console.log(tagList);
  var annotationZonePDF = new AnnotationZonesPDF({
    annotationZoneName: tagList[0],
    relativeCoordinates: {
      X: tagList[1].split(";")[0],
      Y: tagList[1].split(";")[1]
    },
    relativeDimensions: {
      X: tagList[2].split(";")[0],
      Y: tagList[2].split(";")[1]
    },
    color: tagList[3]
  });

  console.log("Added Tag with name: " + tagList[0]);

  // save it to db
  annotationZonePDF.save(function (err) {
      if (err) {
          console.log('annotation submitting error3');
          // call error callback
          console.log(err);
          //errorCallback(err);
      } else {
          // call success callback
          done(err, restList, mainCallback);
      }
  });
};

function submitSingleTagLast(tagList, mainCallback) {
  //console.log(tagList);
  var annotationZonePDF = new AnnotationZonesPDF({
    annotationZoneName: tagList[0],
    relativeCoordinates: {
      X: tagList[1].split(";")[0],
      Y: tagList[1].split(";")[1]
    },
    relativeDimensions: {
      X: tagList[2].split(";")[0],
      Y: tagList[2].split(";")[1]
    },
    color: tagList[3]
  });

  console.log("Added Tag with name: " + tagList[0]);

  // save it to db
  annotationZonePDF.save(function (err) {
      if (err) {
          console.log('annotation submitting error4');
          // call error callback
          console.log(err);
          //errorCallback(err);
      } else {
          // call success callback
          mainCallback();
      }
  });
};



var permArray;

AnnZones.prototype.submitTagList = function(err,tagList, callback){
  if(tagList.length!=0) {
    if(tagList.length>1){
      //console.log(tagList[0]);
      var restList = tagList.slice(1,(tagList.length));
      submitSingleTag(tagList[0],err, restList, callback, this.submitTagList);
    }
    else {
      submitSingleTagLast(tagList[0],callback);
    }
  }
  else {
    callback();
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
      return (count != 0);
});

AnnZones.prototype.getAllAnnotationZones = function(callback) {
  AnnotationZonesPDF.find({},function (err, data) {
    if(err) {
      console.log(err);
    }
    else {
      callback(0, data);
    }
  });
};

module.exports = AnnZones;
