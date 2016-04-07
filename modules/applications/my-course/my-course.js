/**
 *
 * List of all listener related to my course
 *
 */

//var appRoot = require('app-root-path');
//var Plugins = require(appRoot + '/app-root-path');

var debug = require('debug')('cm:server');
var CreatedNodes = require('./models/myCreatedNodes.js');
var PdfRead = require('./models/myPDFStatus.js');
var VideoRead = require('./models/myVideoStatus.model.js');

var MyCourseListener = {
    /**
     * an example of hook on this event onAfterSubTopicCreated
     * this will push/aggregate a newly created subtopic Id into a document for easy use later
     */
    onAfterSubTopicCreated: function(newSubTopic){
        CreatedNodes.findOneAndUpdate(
            {userId: newSubTopic.createdBy, nodeType: "subTopic"},
            {$push: {"treeNodeIds": newSubTopic._id}},
            {safe: true, upsert: true},

            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            });

        /*CreatedNodes.findOne({userId: newSubTopic.createdBy, nodeType: "subTopic"}).
            exec(function(doc){
                if(doc){
                    doc.treeNodeIds.push(newSubTopic._id);
                }else{
                    var cn = new CreatedNodes({
                        userId: newSubTopic.createdBy,
                        treeNodeIds: [newSubTopic._id],
                        nodeType: "subTopic"
                    });

                    cn.save();
                }
            });*/
    },

    /**
     * an example of hook on this event onAfterSubTopicCreated
     * this will push/aggregate a newly created subtopic Id into a document for easy use later
     */
    onAfterContentNodeCreated: function(newContentNode){
        CreatedNodes.findOneAndUpdate(
            {userId: newContentNode.createdBy, nodeType: "contentNode"},
            {$push: {"treeNodeIds": newContentNode._id}},
            {safe: true, upsert: true},

            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            });
    },

    onPdfRead: function(params){
        PdfRead.findOneAndUpdate(
            {
                userId: params.userId,
                courseId:params.courseId,
                resourceId:params.resourceId,
                nodeId:params.nodeId
            },
            {$set: {
                "pageNumber":params.pageNumber,
                "totalPage":params.totalPage,
                "dateAdded": new Date(),
                "dateUpdated": new Date()
            }},
            {safe: true, upsert: true},

            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            }
        );
    },

    onVideoUpdateState: function(params){
        VideoRead.findOneAndUpdate(
            {
                userId: params.userId,
                courseId:params.courseId,
                resourceId:params.resourceId,
                nodeId:params.nodeId
            },
            {$set: {
                "totalTime":params.totalTime,
                "currentTime":params.currentTime,
                "dateAdded": new Date(),
                "dateUpdated": new Date()
            }},
            {safe: true, upsert: true},

            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            }
        );
    }
};

module.exports = MyCourseListener;
