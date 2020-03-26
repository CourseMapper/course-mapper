var AnnotationZonesPDF = require('./annotationZones');
var AnnotationsPDF = require('../slide-viewer/annotation');
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');
var async = require('asyncawait/async');
var foreach = require('async-foreach').forEach;
var await = require('asyncawait/await');
var validator = require('validator');
var appRoot = require('app-root-path');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');



function AnnZones(){
}

AnnZones.prototype.submitAnnotationZone = function(err, params, done){
  var annotationZonePDF = new AnnotationZonesPDF({
    annotationZoneName: params.annotationZoneName,
  });

  // save it to db
  annotationZonePDF.save(function (err) {
      if (err) {
          //console.log('annotation submitting error2');
          // call error callback
          console.log(err);
          //errorCallback(err);
      } else {
          // call success callback

          done(annotationZonePDF);

          Plugin.doAction('onAfterAnnotationZonePdfCreated', annotationZonePDF);
      }
  });
};

AnnZones.prototype.updateAnnotationZone = function(err,params,isAdmin,done) {
  var getAnnZonesById = this.getAnnotationZonesById;
  var upAllRefs = this.updateAllReferences;
  if(typeof params.updateId != 'undefined') {
    this.checkOwnership(params.updateId, params.author, params.authorId, isAdmin, function(success) {
      if(success) {
        AnnotationZonesPDF.findOne({
            _id: params.updateId
          },
          function (errB, data) {
            if(!errB) {
              getAnnZonesById(params.updateId, function(completed,data2){
                if(completed) {
                  var oldTagList = data2;
                  var currentTag = JSON.parse(params.updatedAnnZone);
                  if(!validateTagObject(currentTag,oldTagList,true))
                    err('Server Error: Validation failed for updating of annotation zone');
                  else {
                    var updatedAnnotationZonePDF = {
                      annotationZoneName: currentTag.annotationZoneName,
                      color: currentTag.color
                    };
                    var oldName = data.annotationZoneName;
                    //console.log(data);
                    var newName = currentTag.annotationZoneName;
                    var pdfId = data.pdfId;
                    // save it to db
                    AnnotationZonesPDF.update({_id: params.updateId}, updatedAnnotationZonePDF,function (errB) {
                        if (errB) {
                            err('Server Error: Unable to update annotation zone');
                        } else {
                            upAllRefs(oldName, newName, currentTag.pageNumber, pdfId,err,function(){done();});
                            Plugin.doAction('onAfterAnnotationZonePdfEdited', updatedAnnotationZonePDF);
                        }
                    });
                  }
                }
                else {
                  err('Server Error: Unable to access annotation zone');
                }
              });
            }
            else {
              err('Server Error: Unable to access annotation zone');
            }
          }
        );
      }
      else {
        err("Server Error: Unable to update annotation zone since access was denied or the entry was not found");
      }
    });
  }
  else {
    err("Server Error: Unable to update annotation due to invalid request");
  }
};

AnnZones.prototype.convertRawText2 = function(rawText,id,data, pdfPage){

  var check = AnnZones.prototype.checkTagName;

  //AnnZones.prototype.getAllAnnotationZones(function(success,data){
    //TODO: test for success
    var tagNameList = [];
    var tagColorList = [];
    var tagPageList = [];

    for (var i = 0; i < data.length; i++) {
      tagNameList[i] = data[i].annotationZoneName;
      tagColorList[i] = data[i].color;
      tagPageList[i] = data[i].pdfPageNumber;
    }
    //console.log(data);


    var renderedText = rawText.replace(/#(\w+)((@p)(\w+))?/g, function (x) {
      //console.log("Found tag with name: "+x);
      var strSplit = x.split("@p");
      var hasPage = false;
      var page = 0;
      var originalX = x;
      if (strSplit.length != 2 && strSplit.length != 1) {
        return x;
      }

      if (strSplit.length == 2) {
        x = strSplit[0];
        page = strSplit[1];
        hasPage = true;
      }


      if (check(x, tagNameList) != -1) {
        //console.log("Checked tag with name: "+x);

        var tagId = check(x, tagNameList);
        var ret;
        if(hasPage){
          ret = "<label class='annotationZoneReference' style='color: " + tagColorList[tagId] + "' data-toggle='tooltip' data-placement='bottom' title='Referenced from page "+page+"'>" + originalX + "</label>";
        }else{
          ret = "<label class='annotationZoneReference' style='color: " + tagColorList[tagId] + "'>" + originalX + "</label>";
        }

        if (hasPage && page != tagPageList[tagId])
          return originalX;
        if (!hasPage && pdfPage != tagPageList[tagId])
          return originalX;

        return ret;
      }


      return x;

    });

  return renderedText;
  //});
};

AnnZones.prototype.checkTagName = function(tagName,tagNameList){
//    var annZone = new AnnZones();
//    return annZone.annotationZoneNameExists(tagName);
  for(var i = 0; i < tagNameList.length; i++){
    if(tagName == tagNameList[i])
      return i;
  }
  return -1;

};

AnnZones.prototype.updateAllReferences = function(oldName, newName, pageNumber, pdfId,err,done) {
  /*console.log(AnnotationsPDF);
  var ann = new Comments();
  ann.updateAllReferences(oldName,newName,pdfId,err,done);*/
  var convertRaw = AnnZones.prototype.convertRawText2;
  //console.log(convertRaw);

  var newName2 = validator.escape(newName);

  //console.log("NAMES");
  //console.log("xxx"+pageNumber+"xxx");
  //console.log("xxx"+newName+"xxx");

  AnnotationsPDF.find({pdfId: pdfId}, function (err2, data) {
    if(err2) {
      err("Server Error: Unable to find associated annotations");
    }
    else {
      //console.log("HERE3");
      //console.log(data);

      AnnZones.prototype.getAllAnnotationZones(function(annZoneSucc,annZoneData){
        for(var key in data) {
          var currentId = data[key].id;
          var changed = false;
          var rawText = data[key].rawText;
          var annPage = data[key].pdfPageNumber;
          //console.log("xxx"+annPage+"xxx");

          if(pageNumber == annPage){
            var newRawText = rawText.replace(/#(\w+)/g, function(x){
              //console.log(x);
              if(x == oldName){
                //console.log("found one");
                var ret = newName2;
                changed = true;
                return ret;
              }
              else {
                return x;
              }
            });
          }
          else{
            var newRawText = rawText.replace(/#(\w+)@p[0-9]+/g, function(x){
              //console.log(x);
              //console.log(oldName + "@" + pageNumber);

              if(x == oldName + "@p" + pageNumber){
                //console.log("found one");
                var ret = newName2 + "@p" + pageNumber;
                changed = true;
                return ret;
              }
              else {
                return x;
              }
            });
          }

          //console.log("HEREEE");
          if(changed) {
            //console.log(newRawText);

            //console.log("BLUB");
            //console.log(currentId);
            newRenderedText = convertRaw(newRawText, currentId, annZoneData, annPage);
            var newText = {
              rawText: newRawText,
              renderedText: newRenderedText
            };
            //console.log("HERE2");
            //console.log(newText);
            //console.log(retId;
            //console.log(newText);
            AnnotationsPDF.update({_id: currentId}, newText, function (errBool) {
              if (errBool) {
                err("Server Error: Unable to update annotation");
              } else {
                //console.log("UPDATED");

              }
            });
          }
        }
      });
      done();
    }
  });

};





AnnZones.prototype.checkOwnership = function(id,author,authorId,isAdmin,callback) {
  if(isAdmin)
    callback(true);
  else{
    this.getAnnZoneById(id, function(success,data) {
      if(success) {
        if((author == data.author)&&(authorId == data.authorID)) {
          callback(true);
        }
        else {
          callback(false);
        }
      }
      else {
        callback(false);
      }
    });
  }
};

AnnZones.prototype.getAnnZoneById = function(id,callback) {
  //console.log(id);
  AnnotationZonesPDF.findOne({
    _id: id
  }, function (err, data) {
    if(err) {
      callback(false, data);
    }
    else {
      callback(true, data);
    }
  });
};

/*function submitSingleTag(tagList, pageNumber, err, restList, mainCallback, done) {
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
    color: tagList[3],
    pdfId : 1,
    pdfPageNumber: pageNumber
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
          done(err, restList, pageNumber, mainCallback);
      }
  });
};

function submitSingleTagLast(tagList,pageNumber , mainCallback) {
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
    color: tagList[3],
    pdfId : 1,
    pdfPageNumber: pageNumber
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
*/


var permArray;

/*AnnZones.prototype.submitTagList = function(err,tagList, pageNumber, callback){
  console.log("Received tagList of lenght: " + tagList.length);

  if(tagList.length!=0) {
    if(tagList.length>1){
      //console.log(tagList[0]);
      var restList = tagList.slice(1,(tagList.length));
      submitSingleTag(tagList[0],pageNumber,err, restList, callback, this.submitTagList);
    }
    else {
      submitSingleTagLast(tagList[0],pageNumber,callback);
    }
  }
  else {
    callback();
  }

};*/

AnnZones.prototype.submitTagObjectList = function(err,tags, pdfId, callback){
  this.getAnnotationZonesById(pdfId, function(completed,data){
    if(!completed){
      return callback(false);
    }
    else {
      var oldTagList = data;
      var currentIndex = 0;
      submitSingleTagObject(tags,currentIndex,oldTagList,callback);
    }
  });
};

function submitSingleTagObject(tags,currentIndex,oldTagList,callback) {
  var currentTag = JSON.parse(tags[currentIndex]);
  if(!validateTagObject(currentTag,oldTagList,false)){
    callback(false);
  }
  else {
    /*var annotationZonePDF = new AnnotationZonesPDF({
      annotationZoneName: currentTag.annotationZoneName,
      relativeCoordinates: {
          X: currentTag.relativeCoordinates.X,
          Y: currentTag.relativeCoordinates.Y
      },
      relativeDimensions: {
          X: currentTag.relativeDimensions.X,
          Y: currentTag.relativeDimensions.Y
      },
      color: currentTag.color,
      pdfId: currentTag.pdfId,
      pdfPageNumber: currentTag.pdfPageNumber
    });*/
    var annotationZonePDF = new AnnotationZonesPDF(currentTag);

    // save it to db
    annotationZonePDF.save(function (err) {
        if (err) {
            //console.log('annotation submitting error');
            // call error callback
            callback(false);
            //errorCallback(err);
        } else {
            currentIndex++;
            if(currentIndex == tags.length)
              callback(true);
            else
              submitSingleTagObject(tags,currentIndex,oldTagList,callback);
        }
    });
  }
};

function validateTagObject(currentTag,oldTagList,simple) {
  //console.log(currentTag);
  var ret = true;
  if(!(currentTag.annotationZoneName.length >= 3))
    return false;
  if(!(currentTag.annotationZoneName.length <= 10))
    return false;
  ret &= (currentTag.annotationZoneName[0] == '#');
  ret &= validator.isAlphanumeric(currentTag.annotationZoneName.substring(1));
  ret &= nameIsAvailable(currentTag.annotationZoneName,oldTagList);

  ret &= (currentTag.color[0] == '#');
  ret &= validator.isHexadecimal(currentTag.color.substring(1));
  //ret &= validator.isHexadecimal(currentTag.color);

  if(!simple) {
    //////ret &= validator.isFloat(currentTag.relativeCoordinates.X);
    ret &= !isNaN(currentTag.relativeCoordinates.X);
    //////ret &= validator.isFloat(currentTag.relativeCoordinates.Y);
    ret &= !isNaN(currentTag.relativeCoordinates.Y);
    ret &= (currentTag.relativeCoordinates.X <= 1) && (currentTag.relativeCoordinates.X >= 0)
    ret &= (currentTag.relativeCoordinates.Y <= 1) && (currentTag.relativeCoordinates.Y >= 0)

    //////ret &= validator.isFloat(currentTag.relativeDimensions.X);
    ret &= !isNaN(currentTag.relativeDimensions.X);
    //////ret &= validator.isFloat(currentTag.relativeDimensions.Y);
    ret &= !isNaN(currentTag.relativeDimensions.Y);
    ret &= (currentTag.relativeDimensions.X <= 1) && (currentTag.relativeDimensions.X >= 0)
    ret &= (currentTag.relativeDimensions.Y <= 1) && (currentTag.relativeDimensions.Y >= 0)
    ret &= (currentTag.relativeDimensions.X + currentTag.relativeCoordinates.X <= 1)
    ret &= (currentTag.relativeDimensions.Y + currentTag.relativeCoordinates.Y <= 1)

    ret &= validator.isHexadecimal(currentTag.pdfId);
    //////ret &= validator.isDecimal(currentTag.pdfPageNumber);
    ret &= !isNaN(currentTag.pdfPageNumber);
  }
  return ret;
};

function nameIsAvailable(name,tagList) {
  var i;
  for(i = 0; i < tagList.length; i++) {
    if(tagList[i].annotationZoneName == name)
      return false;
  }
  return true;
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


/*AnnZones.prototype.handleZoneSubmitPost = function(req, res, next) {
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
};*/

//TODO: finish
AnnZones.prototype.handleUpdatePost = function(req, res, next) {
    this.updateAnnotationZone(
        function error(err){
            return res.status(200).send({result:false, error: err});
        },
        req.query,
        req.user.role == "admin",
        function done(annotationsPDF) {
            return res.status(200).send({result: true, annotationsPDF: annotationsPDF});
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
      callback(false, "");
    }
    else {
      callback(true, data);
    }
  });
};

AnnZones.prototype.getSpecificAnnotationZones = function(id, page, callback) {
  AnnotationZonesPDF.find({pdfId : id, pdfPageNumber : page},function (err, data) {
    if(err) {
      callback(false, "");
    }
    else {
      callback(true, data);
    }
  });
};

AnnZones.prototype.getAnnotationZonesById = function(id, callback) {
  AnnotationZonesPDF.find({pdfId : id},function (err, data) {
    if(err) {
      callback(false, "");
    }
    else {
      callback(true, data);
    }
  });
};


module.exports = AnnZones;
