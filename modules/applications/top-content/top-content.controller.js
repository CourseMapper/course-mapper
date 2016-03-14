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
var _ = require('underscore');

function topContent() {

}

topContent.prototype.getTopPdf = function (error, params, done) {
    if (!helper.checkRequiredParams(params, ['courseId'], error)) {
        return;
    }

    params.courseId = mongoose.Types.ObjectId(params.courseId);
    params.isDeleted = false;

    SubTopics.find(params).populate({path: 'resources'}).select('name resources').exec(function (err, res){
    //SubTopics.find(params).select('name resources').exec(function (err, res){
        if (err) error(err);
        else {
            var resIds = _(res).pluck('resources').map(function(doc){return doc._id});
            //var getIds = _.each(res, resIds);
            /*res.find({resources:{$elemMatch: { type: "pdf"} }}).exec(function(err, docs){
               if (err) error (err);
                else {done (docs)}
            });*/

            //done(res[0].resources[0]);
            done(resIds);

           /* var pdfId= _.map(res, function(currRes) {
                return _.map(currRes.resources, function (el, i){
                    return {resourceId: el._id};
                })
            });

            var ids = _.forEach(res, function (doc){
                _.forEach(doc.resources, function (el,i){
                    return {resId: el._id}
                })
            });*/
            //var res2 = _.flatten(_.map(res, _.value));
            //var arrOfPdfId = [];

            //var resourceResult = _.find(res.resources)
            /*var pdfId= _.map(res.resources, function(currRes) {
                    return {id: currRes._id};
            });*/
            //done (res2);
            /*PdfAnnotation.aggregate([
                {$match: {resources._id:ids}},
                {$unwind: "$resources"}
            ]).exec(function (error, docs){
                if (error) error (error);
                else {
                    done(docs);
                }
            });*/
           /*PdfAnnotation.find({pdfId: {$in: ids},hasParent: false }).exec(function (error, docs){
                if (error) error (error);
                else {
                    done(docs);
                }
            });*/

        }
    });

};

module.exports = topContent;