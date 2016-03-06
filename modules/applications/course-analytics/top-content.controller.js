var config = require('config');
var UserCourses = require('../../catalogs/userCourses.js');
var Courses = require('../../catalogs/courses.js');
var Resources = require('../../trees/resources.js');
var Posts = require('../../discussion/models/posts.js');
var PdfAnnotation = require('../../slide-viewer/annotation.js');
var VideoAnnotation = require('../../annotations/video-annotation.js');
var SubTopics = require('../../trees/treeNodes.js');
var Links = require('../../links/models/links.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var handleUpload = require(appRoot + '/libs/core/handleUpload.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var moment = require('moment');
var today = moment().startOf('day');
var lastYear = moment(today).subtract(12, 'months');

function topContent() {

}

topContent.prototype.getTopPdf = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.isDeleted = false;

    Resources.find(params).exec(function (err, res){
        if (err) error(err);
        else {
            var ids = res.map(function(doc){return doc._id});
            PdfAnnotation.find({pdfId: {$in: ids},hasParent: false }).populate('pdfId', 'treeNodeId').exec(function (error, docs){
                if (error) error (error);
                else {done(docs)}
            });

        }
    });

};

module.exports = topContent;