/**
 *
 * your application logic goes here
 *
 */

//var appRoot = require('app-root-path');
//var Plugins = require(appRoot + '/app-root-path');

var debug = require('debug')('cm:server');
var CreatedNodes = require('./myCreatedNodes.js');

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
                if(!err) debug('my-course: new node aggregated');
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
        /*CreatedNodes.findOne({userId: newContentNode.createdBy, nodeType: "contentNode"}).
            exec(function(doc){
                if(doc){
                    doc.treeNodeIds.push(newContentNode._id);
                    doc.save();
                } else {
                    var cn = new CreatedNodes({
                        userId: newContentNode.createdBy,
                        treeNodeIds: [newContentNode._id],
                        nodeType: "contentNode"
                    });

                    cn.save();
                }
            });*/
        CreatedNodes.findOneAndUpdate(
            {userId: newContentNode.createdBy, nodeType: "contentNode"},
            {$push: {"treeNodeIds": newContentNode._id}},
            {safe: true, upsert: true},

            function(err, doc){
                if(!err) debug('my-course: new node aggregated');
                else
                    debug(err);
            });
    },

    onPdfRead: function(params){
        /**
         * {
        courseId: mongoObjectId,
        nodeId: mongoObjectId,
        resourceId: mongoObjectId,
        pageNumber: int,
        userId: mongoObjectId
    }
         */

        console.log('courseId = ' + params.courseId);
    }
};

module.exports = MyCourseListener;
