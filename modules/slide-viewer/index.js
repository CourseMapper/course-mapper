var AnnotationsPDF = require('./annotation');
var UserModel = require('../accounts/users');
var config = require('config');
var passport = require('passport');
var mongoose = require('mongoose');
var AnnZones = require('../annotationZones/index');
var validator = require('validator');
var appRoot = require('app-root-path');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');
var _ = require('lodash');

function Comment() {
}

Comment.prototype.updateAllReferences = function (oldName, newName, pdfId, err, done) {
    var newName2 = validator.escape(newName);


    AnnotationsPDF.find({pdfId: pdfId}, function (err2, data) {
        if (err2) {
            err("Server Error: Unable to find associated annotations");
        } else {
            for (var key in data) {
                var changed = false;
                var rawText = data[key].rawText;
                var newRawText = rawText.replace(/#(\w+)/g, function (x) {
                    if (x == oldName) {
                        var ret = newName2;
                        changed = true;
                        return ret;
                    } else {
                        return x;
                    }
                });
                if (changed) {
                    this.convertRawTextID(newRawText, function (newRenderedText) {
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
                    }, pdfId);
                }
            }
        }
    });
};

Comment.prototype.submitAnnotation = function (err, params, done) {
    if (typeof params.hasParent == 'undefined') {
        err("Server Error: Missing hasParent element");
    } else {
        params.hasParent = (params.hasParent === "true");
        if (params.hasParent == false) {
            this.submitFirstLevelAnnotation(err, params, done);
        } else {
            this.submitReplyAnnotation(err, params, done);
        }
    }
};


//TODO: Temporary reply function. Later when replies have more functionality maybe merge with submitFirstLevelAnnotation
Comment.prototype.submitReplyAnnotation = function (err, params, done) {
    var temp = this.convertRawTextSpecific;

    var htmlEscapedRawText = validator.escape(params.rawText);
    //var htmlEscapedRawText = params.rawText;
    temp(htmlEscapedRawText, function (renderedText) {
        var annotationsPDF = new AnnotationsPDF({
            rawText: htmlEscapedRawText,
            renderedText: renderedText,
            author: params.author,
            authorID: params.authorID,
            authorDisplayName: params.authorDisplayName,
            pdfId: params.pdfId,
            pdfPageNumber: params.pageNumber,
            hasParent: params.hasParent,
            parentId: params.parentId
        });

        //console.log(annotationsPDF);

        // save it to db
        annotationsPDF.save(function (errBool) {
            if (errBool) {
                err("Server Error: Unable to store annotation");
            } else {
                // call success callback

                Plugin.doAction('onAfterPdfReplyCreated', annotationsPDF);
                done(annotationsPDF);
            }
        });
    }, params.pdfId, params.pageNumber);
};

Comment.prototype.submitFirstLevelAnnotation = function (err, params, done) {
    var temp = this.convertRawTextSpecific;
    var annZones = [];
    //Small fix to avoid problems arising from empty annZone lists
    if (params.numOfAnnotationZones == 1)
        annZones[0] = params.annotationZones;
    else
        annZones = params.annotationZones;
    this.submitAllTagsObject(err, annZones, params.pdfId, function (completed) {
        if (completed) {
            //var htmlEscapedRawText = validator.escape(params.rawText);//TODO: Put back in when whitelisting is complete
            var htmlEscapedRawText = params.rawText;
            temp(htmlEscapedRawText, function (renderedText) {
                var annotationsPDF = new AnnotationsPDF({
                    rawText: htmlEscapedRawText,
                    renderedText: renderedText,
                    author: params.author,
                    authorID: params.authorID,
                    authorDisplayName: params.authorDisplayName,
                    pdfId: params.pdfId,
                    pdfPageNumber: params.pageNumber,
                    hasParent: params.hasParent,
                    isPrivate: params.isPrivate
                });


                // save it to db
                annotationsPDF.save(function (errBool) {
                    if (errBool) {
                        err("Server Error: Unable to store annotation");
                    } else {
                        // call success callback
                        Plugin.doAction('onAfterPdfAnnotationCreated', annotationsPDF);
                        done(annotationsPDF);

                    }
                });
            }, params.pdfId, params.pageNumber);
        } else {
            err("Server Error: Unable to store one or more annotation zones");
        }
    });
};


Comment.prototype.deleteAnnotation = function (err, params, isAdmin, user, done) {
    if (typeof params.deleteId != 'undefined') {
        this.checkOwnership(params.deleteId, params.author, params.authorId, isAdmin, function (success) {
            if (success) {
                AnnotationsPDF.findOne({_id: params.deleteId}).exec(function (err, doc) {
                    if (doc) {
                        doc.remove();
                        Plugin.doAction('onAfterPdfAnnotationDeleted', doc, user);

                        done();
                    }
                });
            } else {
                err("Server Error: Unable to delete annotation since access was denied or the entry was not found");
            }
        });
    } else {
        err("Server Error: Unable to delete annotation due to invalid request");
    }
};

Comment.prototype.updateAnnotation = function (err, params, isAdmin, user, done) {
    //console.log("STARTED");
    if (typeof params.updateId != 'undefined') {
        this.checkOwnership(params.updateId, params.author, params.authorId, isAdmin, function (success) {
            if (success) {
                var temp = Comment.prototype.convertRawTextSpecific;
                //var htmlEscapedRawText = validator.escape(params.rawText);
                var htmlEscapedRawText = params.rawText;
                temp(htmlEscapedRawText, function (renderedText) {
                    var updatedAnnotationsPDF = {
                        rawText: htmlEscapedRawText,
                        renderedText: renderedText,
                        isPrivate: params.isPrivate
                    };
                    // save it to db
                    AnnotationsPDF.update({_id: params.updateId}, updatedAnnotationsPDF, function (errBool) {
                        if (errBool) {
                            err("Server Error: Unable to update annotation");
                        } else {
                            // call success callback
                            Plugin.doAction('onAfterPdfAnnotationEdited', params, user);
                            done();
                        }
                    });
                }, params.pdfId, params.pageNumber);
            } else {
                err("Server Error: Unable to update annotation since access was denied or the entry was not found");
            }
        });
    } else {
        err("Server Error: Unable to update annotation due to invalid request");
    }
};

Comment.prototype.checkOwnership = function (id, author, authorId, isAuthor, callback) {
    if (isAuthor)
        callback(true);
    else {
        this.getCommentById(id, function (success, data) {
            if (success == true) {
                if ((author == data.author) && (authorId == data.authorID)) {
                    callback(true);
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        });
    }
};

Comment.prototype.getCommentById = function (id, callback) {
    AnnotationsPDF.findOne({
        _id: id
    }, function (err, data) {
        if (err) {
            callback(false, data);
        } else {
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

Comment.prototype.submitAllTagsObject = function (err, tags, pdfId, callback) {
    var annZone = new AnnZones();
    if (typeof tags == 'undefined')
        callback(true);
    else {
        if (tags.length == 0) {
            callback(true);
        } else {
            annZone.submitTagObjectList(err, tags, pdfId, callback);
        }
    }
}


//TODO Really check if tag name exists
Comment.prototype.checkTagName = function (tagName, tagNameList) {
//    var annZone = new AnnZones();
//    return annZone.annotationZoneNameExists(tagName);
    for (var i = 0; i < tagNameList.length; i++) {
        if (tagName == tagNameList[i])
            return i;
    }
    return -1;

}

Comment.prototype.getAllTagNamesById = function (pdfID, callback) {
    var annZone = new AnnZones();
    annZone.getAnnotationZonesById(pdfID, callback);
}

Comment.prototype.getAllTagNames = function (callback) {
    var annZone = new AnnZones();
    annZone.getAnnotationZones(callback);
}


//TODO Not working correctly yet

Comment.prototype.convertRawText = function (rawText, callback) {
    Comment.prototype.convertRawTextSpecific(rawText, callback, -1, -1)
};

Comment.prototype.convertRawTextID = function (rawText, callback, pdfID) {
    Comment.prototype.convertRawTextSpecific(rawText, callback, pdfID, -1)
};

Comment.prototype.convertRawTextSpecific = function (rawText, callback, pdfID, pdfPage) {
    var check = this.checkTagName;
    var comm = new Comment();

    var getNamesCallback = function (success, data) {
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
            var comm = new Comment();
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


            if (comm.checkTagName(x, tagNameList) != -1) {
                //console.log("Checked tag with name: "+x);

                var tagId = comm.checkTagName(x, tagNameList);
                var ret;
                if (hasPage) {
                    ret = "<label class='annotationZoneReference' style='color: " + tagColorList[tagId] + "' data-toggle='tooltip' data-placement='bottom' title='Referenced from page " + page + "'>" + originalX + "</label>";
                } else {
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

        callback(renderedText);
    };

    if (pdfID != -1)
        comm.getAllTagNamesById(pdfID, getNamesCallback);
    else
        comm.getAllTagNames(getNamesCallback);

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


Comment.prototype.handleSubmitPost = function (req, res, next) {
    //console.log(req);
    this.submitAnnotation(
        function error(err) {
            return res.status(200).send({result: false, error: err});
        },
        req.query,
        function done(annotationsPDF) {
            // todo: implement flash
            return res.status(200).send({result: true, annotationsPDF: annotationsPDF});
            // todo: implement redirect to previous screen.
        }
    );
};

Comment.prototype.handleDeletePost = function (req, res, next) {
    //console.log(req);
    this.deleteAnnotation(
        function error(err) {
            return res.status(200).send({result: false, error: err});
        },
        req.query,
        req.user.role == "admin",
        req.user,
        function done() {
            // todo: implement flash
            return res.status(200).send({result: true});
            // todo: implement redirect to previous screen.
        }
    );
};

Comment.prototype.handleUpdatePost = function (req, res, next) {
    //console.log(req);
    this.updateAnnotation(
        function error(err) {
            return res.status(200).send({result: false, error: err});
        },
        req.query,
        req.user.role == "admin",
        req.user,
        function done() {
            // todo: implement flash
            return res.status(200).send({result: true});
            // todo: implement redirect to previous screen.
        }
    );
};

Comment.prototype.numberOfComments = function (callback) {
    var numComments = 0;
    AnnotationsPDF.count({}, function (err, count) {
        if (err) {
            console.log(err);
        } else {
            callback(0, count);
        }

    });
};

Comment.prototype.getAllComments = function (callback) {
    AnnotationsPDF.find({}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            callback(0, data);
        }

    });
};

/**
 * Get all annotations of a PDF by ID.
 */
Comment.prototype.getPdfAnnotations = function (pdfId, done) {
    return AnnotationsPDF.find({pdfId: pdfId}, done).exec();
};

Comment.prototype.getOrderedFilteredComments = function (req, callback) {

    var order = JSON.parse(req.params.order);
    var filters = JSON.parse(req.params.filters);
    var user = req.user;

    var checkHasRightToModify = function (model, user) {
        if (!model || !user || !user.role) {
            return false;
        }
        var isAuthor = model.authorID === user._id;
        var isAdmin = user.role === 'admin';
        return isAuthor || isAdmin;
    };

    var checkAccess = function (item, user) {
        return item.isPrivate !== true || checkHasRightToModify(item, user);
    };

    var orderString = "" + order.type;
    if (order.ascending == "false") {
        orderString = "-" + orderString;
    }

    if (typeof filters["renderedText"] != 'undefined') {
        if (typeof filters["renderedText"]["regex_hash"] != 'undefined') {
            filters["renderedText"] = new RegExp('#' + filters["renderedText"]["regex_hash"], 'i');
        }
    }

    if (typeof filters["renderedText"] != 'undefined') {
        if (typeof filters["renderedText"]["regex"] != 'undefined') {
            filters["renderedText"] = new RegExp(filters["renderedText"]["regex"], 'i');
        }
    }

    if (typeof filters["rawText"] != 'undefined') {
        if (typeof filters["rawText"]["regex"] != 'undefined') {
            filters["rawText"] = new RegExp(filters["rawText"]["regex"], 'i');
        }
    }

    AnnotationsPDF.find(filters).sort(orderString).exec(function (err, data) {
        if (err) {
            return err;
        }
        var items = _.filter(data, function (item) {
            return checkAccess(item, user);
        });
        callback(0, items);
    });
};
module.exports = Comment;
