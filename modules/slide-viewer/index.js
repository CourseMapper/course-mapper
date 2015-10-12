var AnnotationsPDF = require('./annotation')
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');
var AnnZones = require('../annotationZones/index');
var validator = require('validator');

function Comment(){
}

Comment.prototype.updateAllReferences = function(oldName, newName, pdfId,err,done) {
  var newName2 = validator.escape(newName);

  AnnotationsPDF.find({pdfId: pdfId}, function (err2, data) {
    if(err2) {
      err("Server Error: Unable to find associated annotations");
    }
    else {
      for(var key in data) {
        var changed = false;
        var rawText = data[key].rawText;
        var newRawText = rawText.replace(/#(\w+)/g, function(x){
          if(x == oldName){
            var ret = newName2;
            changed = true;
            return ret;
          }
          else {
            return x;
          }
        });
        if(changed) {
          this.convertRawText(newRawText, function(newRenderedText){
            var newText = {
              rawText: newRawText,
              renderedText: newRenderedText
            };
            AnnotationsPDF.update({_id: data[key].id}, newText, function (errBool) {
              if (errBool) {
                err("Server Error: Unable to update annotation");
              } else {
                done();
              }
            });
          });
        }
      }
    }
  });
};

Comment.prototype.submitAnnotation = function(err, params, done){
  if(typeof params.hasParent == 'undefined') {
    err("Server Error: Missing hasParent element");
  }
  else {
    params.hasParent = (params.hasParent === "true");
    if(params.hasParent == false) {
      this.submitFirstLevelAnnotation(err,params,done);
    }
    else {
      this.submitReplyAnnotation(err,params,done);
    }
  }
};


//TODO: Temporary reply function. Later when replies have more functionality maybe merge with submitFirstLevelAnnotation
Comment.prototype.submitReplyAnnotation = function(err, params,done){
  var temp = this.convertRawText;

  var htmlEscapedRawText = validator.escape(params.rawText);
  //var htmlEscapedRawText = params.rawText;
  temp(htmlEscapedRawText,function(renderedText){
    var annotationsPDF = new AnnotationsPDF({
      rawText: htmlEscapedRawText,
      renderedText: renderedText,
      author: params.author,
      authorID: params.authorID,
      pdfId: params.pdfId,
      pdfPageNumber: params.pageNumber,
      hasParent: params.hasParent,
      parentId: params.parentId
    });

    console.log(annotationsPDF);

    // save it to db
    annotationsPDF.save(function (errBool) {
      if (errBool) {
        err("Server Error: Unable to store annotation");
      } else {
        // call success callback
        done(annotationsPDF);
      }
    });
  });
};

Comment.prototype.submitFirstLevelAnnotation = function(err, params,done){
  var temp = this.convertRawText;

  var annZones = [];
  //Small fix to avoid problems arising from empty annZone lists
  if(params.numOfAnnotationZones==1)
    annZones[0] = params.annotationZones;
  else
    annZones = params.annotationZones;

  this.submitAllTagsObject(err,annZones,params.pdfId,function(completed){
    if(completed){
      //var htmlEscapedRawText = validator.escape(params.rawText);//TODO: Put back in when whitelisting is complete
      var htmlEscapedRawText = params.rawText;
      temp(htmlEscapedRawText,function(renderedText){
        var annotationsPDF = new AnnotationsPDF({
          rawText: htmlEscapedRawText,
          renderedText: renderedText,
          author: params.author,
          authorID: params.authorID,
          pdfId: params.pdfId,
          pdfPageNumber: params.pageNumber,
          hasParent: params.hasParent
        });



        // save it to db
        annotationsPDF.save(function (errBool) {
            if (errBool) {
                err("Server Error: Unable to store annotation");
            } else {
                // call success callback

                done(annotationsPDF);

            }
          });
        });
      }
      else{
        err("Server Error: Unable to store one or more annotation zones");
      }
  });
};


Comment.prototype.deleteAnnotation = function(err,params,done){
  if(typeof params.deleteId != 'undefined') {
    this.checkOwnership(params.deleteId, params.author, params.authorId, function(success) {
      if(success) {
        AnnotationsPDF.findOne({ _id: params.deleteId }).remove().exec();
        done();
      }
      else {
        err("Server Error: Unable to delete annotation since access was denied or the entry was not found");
      }
    });
  }
  else {
    err("Server Error: Unable to delete annotation due to invalid request");
  }
};



Comment.prototype.updateAnnotation = function(err,params,done) {
  if(typeof params.updateId != 'undefined') {
    this.checkOwnership(params.updateId, params.author, params.authorId, function(success) {
      if(success) {
        var temp = Comment.prototype.convertRawText;

        //var htmlEscapedRawText = validator.escape(params.rawText);
        var htmlEscapedRawText = params.rawText;
        temp(htmlEscapedRawText,function(renderedText){
          var updatedAnnotationsPDF = {
            rawText: htmlEscapedRawText,
            renderedText: renderedText
          };

          // save it to db
          AnnotationsPDF.update({_id: params.updateId}, updatedAnnotationsPDF, function (errBool) {
            if (errBool) {
              err("Server Error: Unable to update annotation");
            } else {
              // call success callback
              done();
            }
          });
        });
      }
      else {
        err("Server Error: Unable to update annotation since access was denied or the entry was not found");
      }
    });
  }
  else {
    err("Server Error: Unable to update annotation due to invalid request");
  }
};

Comment.prototype.checkOwnership = function(id,author,authorId,callback) {
  this.getCommentById(id, function(success,data) {
    if(success == true) {
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
};

Comment.prototype.getCommentById = function(id, callback) {
  AnnotationsPDF.findOne({
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

/*Comment.prototype.submitAllTags = function(err,tagNames,tagRelPos,tagRelCoord,tagColor,pageNumber,callback){
  var annZone = new AnnZones();
  if(typeof tagNames == 'undefined')
    callback();
  else {
    var tagNameList = tagNames.split(",");
    var tagRelPosList = tagRelPos.split(",");
    var tagRelCoordList = tagRelCoord.split(",");
    var tagColorList = tagColor.split(",");


    if(tagNames.length == 0){
      callback();
    }
    else if((tagNameList.length == tagRelPosList.length) && (tagRelCoordList.length == tagRelPosList.length) && (tagRelCoordList.length == tagColorList.length)) {
      var tagList = [];
      console.log(tagNameList.length);
      for(var n=0; n<tagNameList.length; n++) {
        tagList[n] = [];
        tagList[n][0] = tagNameList[n];
        tagList[n][1] = tagRelPosList[n];
        tagList[n][2] = tagRelCoordList[n];
        tagList[n][3] = tagColorList[n];

      }

      annZone.submitTagList(err,tagList,pageNumber,callback);
    }
    else
      console.log("Error: Tag string-lists differ");

  }
}*/

Comment.prototype.submitAllTagsObject = function(err,tags,pdfId,callback){
  var annZone = new AnnZones();
  if(typeof tags == 'undefined')
    callback(true);
  else {
    if(tags.length == 0){
      callback(true);
    }
    else{
      annZone.submitTagObjectList(err,tags,pdfId,callback);
    }
  }
}



//TODO Really check if tag name exists
Comment.prototype.checkTagName = function(tagName,tagNameList){
//    var annZone = new AnnZones();
//    return annZone.annotationZoneNameExists(tagName);
  for(var i = 0; i < tagNameList.length; i++){
    if(tagName == tagNameList[i])
      return i;
  }
  return -1;

}

Comment.prototype.getAllTagNames = function(callback){
    var annZone = new AnnZones();
    annZone.getAllAnnotationZones(callback);
}


//TODO Not working correctly yet
Comment.prototype.convertRawText = function(rawText,callback){


  var check = this.checkTagName;

  var comm = new Comment();
  comm.getAllTagNames(function(success,data){
    //TODO: test for success
    var tagNameList = [];
    var tagColorList = [];

    for(var i = 0; i < data.length; i++){
      tagNameList[i] = data[i].annotationZoneName;
      tagColorList[i] = data[i].color;
    }
    //console.log(data);


    var renderedText = rawText.replace(/#(\w+)/g, function(x){
        var comm = new Comment();
        console.log("Found tag with name: "+x);
        if(comm.checkTagName(x,tagNameList) != -1){
          console.log("Checked tag with name: "+x);

          var ret = "<label class='annotationZoneReference' style='color: #" + tagColorList[comm.checkTagName(x,tagNameList)] + "'>" + x + "</label>";
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
            return res.status(200).send({result:false, error: err});
        },
        req.query,
        function done(annotationsPDF) {
            // todo: implement flash
            return res.status(200).send({result: true, annotationsPDF: annotationsPDF});
            // todo: implement redirect to previous screen.
        }
    );
};

Comment.prototype.handleDeletePost = function(req, res, next) {
    //console.log(req);
    this.deleteAnnotation(
        function error(err){
            return res.status(200).send({result:false, error: err});
        },
        req.query,
        function done() {
            // todo: implement flash
            return res.status(200).send({result: true});
            // todo: implement redirect to previous screen.
        }
    );
};

Comment.prototype.handleUpdatePost = function(req, res, next) {
    //console.log(req);
    this.updateAnnotation(
        function error(err){
            return res.status(200).send({result:false, error: err});
        },
        req.query,
        function done() {
            // todo: implement flash
            return res.status(200).send({result: true});
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

    var orderString= ""+order.type;
    if(order.ascending == "false")
    {
      //console.log("inside if");
      orderString = "-"+orderString;
    }



    if(typeof filters["renderedText"] != 'undefined') {
      if(typeof filters["renderedText"]["regex_hash"] != 'undefined'){
        filters["renderedText"] = new RegExp('#' + filters["renderedText"]["regex_hash"],'i');
        console.log("found tag request");
      }
    }

    if(typeof filters["renderedText"] != 'undefined') {
      if(typeof filters["renderedText"]["regex"] != 'undefined'){
        filters["renderedText"] = new RegExp(filters["renderedText"]["regex"],'i');
        console.log("found tag request");
      }
    }

    if(typeof filters["rawText"] != 'undefined') {
      if(typeof filters["rawText"]["regex"] != 'undefined'){
        filters["rawText"] = new RegExp(filters["rawText"]["regex"],'i');
        console.log("found tag request");
      }
    }


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
