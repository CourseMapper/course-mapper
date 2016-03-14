//listener file name should equal to folder name

var debug = require('debug')('cm:server');
var TopContentAgg = require('./models/topContent.model.js');
var SubTopics = require('../../trees/treeNodes.js');
var Posts = require('../../discussion/models/posts.js');
var Courses = require('../../catalogs/courses.js');
var PdfAnnotation = require('../../slide-viewer/annotation.js');
var PdfAnnotationZone = require('../../annotationZones/annotationZones.js');
var VideoAnnotation = require('../../annotations/video-annotation.js');
var Resources = require('../../trees/resources.js');
var Links = require('../../links/models/links.js');
//var Discussions = require('../../discussion/models/courseDiscussions.js');
var UserCourses = require('../../catalogs/userCourses.js');

var topContentListener = {

    //Listener for PDF
    onAfterPdfAnnotationCreated: function (newPdfAnnotation) {
        PdfAnnotation.findOne({_id: newPdfAnnotation._id})
            .exec(function (err, doc) {
                if (doc) {
                    var pdfId = doc.pdfId;
                    if (pdfId) {
                        Resources.findOne({_id: pdfId})
                            .exec(function(err, result){
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId){
                                        SubTopics.findOne({_id:treeNodeId})
                                            .exec(function(err, res){
                                                if (res) {
                                                    var condition = {contentId: pdfId}, update = {$inc: {count: 1}};
                                                    TopContentAgg.findOne(condition)
                                                        .exec(function(err, resTC){
                                                            if (resTC) {
                                                                TopContentAgg.update(condition, update).exec();
                                                            }
                                                            else {
                                                                var nf = new TopContentAgg(
                                                                    {
                                                                        courseId: result.courseId,
                                                                        nodeId: res.id,
                                                                        contentId : pdfId,
                                                                        contentName : res.name,
                                                                        contentType : "pdf",
                                                                        countType : "annotation",
                                                                        count : 1
                                                                    }
                                                                );
                                                                nf.save(
                                                                    function (err, doc) {
                                                                        if (!err) debug('');
                                                                        else
                                                                            debug(err);
                                                                    }
                                                                );
                                                            }
                                                        });





                                                }

                                            })



                                    }

                                }
                            })
                    }
                }
            });

    },

    //Listener for Video
    onAfterVideoAnnotationCreated: function (newVideoAnnotation) {
        VideoAnnotation.findOne({_id:newVideoAnnotation})
            .exec(function(err, doc){
                if (doc) {
                    var videoId = doc.video_id;
                    if (videoId) {
                        Resources.findOne({_id:videoId})
                            .exec(function(err, result){
                                if (result) {
                                    var treeNodeId = result.treeNodeId;
                                    if (treeNodeId) {
                                        SubTopics.findOne({_id:treeNodeId})
                                            .exec(function(err, res){
                                                if (res) {
                                                    var condition = {contentId: videoId}, update = {$inc: {count: 1}};
                                                    TopContentAgg.findOne(condition)
                                                        .exec(function(err, resTC){
                                                            if (resTC) {
                                                                TopContentAgg.update(condition, update).exec();
                                                            }
                                                            else {
                                                                var nf = new TopContentAgg(
                                                                    {
                                                                        courseId: result.courseId,
                                                                        nodeId: res.id,
                                                                        contentId : videoId,
                                                                        contentName : res.name,
                                                                        contentType : "video",
                                                                        countType : "annotation",
                                                                        count : 1
                                                                    }
                                                                );
                                                                nf.save(
                                                                    function (err, doc) {
                                                                        if (!err) debug('');
                                                                        else
                                                                            debug(err);
                                                                    }
                                                                );
                                                            }
                                                        });





                                                }

                                            })
                                    }
                                }
                            })
                    }
                }
            });
    },

    onAfterVideoAnnotationDeleted: function (deleteVideoAnnotation) {

        var videoId = deleteVideoAnnotation.video_id;
        if (videoId) {
            Resources.findOne({_id:videoId})
                .exec(function(err, result){
                    if (result) {
                        var treeNodeId = result.treeNodeId;
                        if (treeNodeId) {
                            SubTopics.findOne({_id:treeNodeId})
                                .exec(function(err, res){
                                    if (res) {
                                        var condition = {contentId: videoId}, update = {$inc: {count: -1}};
                                        TopContentAgg.findOne(condition)
                                            .exec(function(err, resTC){
                                                if (resTC) {
                                                    TopContentAgg.update(condition, update).exec();
                                                }
                                                else {
                                                    console.log('could not find document');
                                                }
                                            });





                                    }

                                })
                        }
                    }
                })
        }

    }

};

module.exports = topContentListener;