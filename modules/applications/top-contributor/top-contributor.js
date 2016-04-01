//listener file name should equal to folder name

var debug = require('debug')('cm:server');
//var TopContentAgg = require('../top-content/models/topContent.model.js');
var TopContributorAgg = require('./models/topContributor.model.js');
var TreeNodes = require('../../trees/treeNodes.js');
var Posts = require('../../discussion/models/posts.js');
var Courses = require('../../catalogs/courses.js');
var PdfAnnotation = require('../../slide-viewer/annotation.js');
var PdfAnnotationZone = require('../../annotationZones/annotationZones.js');
var VideoAnnotation = require('../../annotations/video-annotation.js');
var Resources = require('../../trees/resources.js');
var Links = require('../../links/models/links.js');
//var Discussions = require('../../discussion/models/courseDiscussions.js');
var UserCourses = require('../../catalogs/userCourses.js');

var topContributorListener = {

    //When user add subtopic, increase counter
    onAfterSubTopicCreated: function (newSubtopicNode) {
        TreeNodes.findOne({_id: newSubtopicNode._id})
            .exec(function (err, doc) {
                if (doc) {
                    var courseId = doc.courseId;
                    var userId = doc.createdBy;
                    if (courseId) {
                        var condition = {userId: userId, courseId:courseId}, update = {$inc: {totalCount: 1, countCourseActivity: 1}};
                        TopContributorAgg.findOne(condition)
                            .exec(function(err, resTC){
                                if (resTC) {
                                    TopContributorAgg.update(condition, update).exec();
                                }
                                else {
                                    var nf = new TopContributorAgg(
                                        {
                                            userId: userId,
                                            courseId: courseId,
                                            countCourseActivity: 1,
                                            countNodeActivity : 0,
                                            totalCount : 1
                                        }
                                    );
                                    nf.save(
                                        function (err, docs) {
                                            if (!err) debug('');
                                            else
                                                debug(err);
                                        }
                                    );
                                }
                            });

                    }

                }
            });

    }
};

module.exports = topContributorListener;