var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var moment = require ('moment');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
//var TreeNodes = require(appRoot + '/modules/trees/treeNodes.js');
var UserCourses = require(appRoot + '/modules/catalogs/userCourses.js');
var Resources = require(appRoot + '/modules/trees/resources.js');
var Posts = require(appRoot + '/modules/discussion/models/posts.js');

function CourseListBasicStats(){
}

CourseListBasicStats.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.cid);
};

CourseListBasicStats.prototype.run = async(function(){
    var self = this;
    var countEnrolledUser = await( UserCourses.find({
        course: self._id,
        isEnrolled: 'true'
    }).count().exec());

    var countTotalVideo = await(Resources.find({
        courseId: self._id,
        type: {$ne: 'pdf'},
        isDeleted: false
    }).count().exec());

    var countTotalPdf = await(Resources.find({
        courseId: self._id,
        type: 'pdf',
        isDeleted: false
    }).count().exec());

    var countTotalDiscussion = await(Posts.find({
        course: self._id,
        isDeleted: false
    }).count().exec());

    if (countEnrolledUser) {
        self.countEnrolledUser = countEnrolledUser;
    } else {
        self.countEnrolledUser = 0;
    };

    if (countTotalVideo) {
        self.countTotalVideo = countTotalVideo;
    } else {
        self.countTotalVideo = 0;
    };

    if (countTotalPdf) {
        self.countTotalPdf = countTotalPdf;
    } else {
        self.countTotalPdf = 0;
    };

    if (countTotalDiscussion) {
        self.countTotalDiscussion = countTotalDiscussion;
    } else {
        self.countTotalDiscussion = 0;
    };
    
    
});

CourseListBasicStats.prototype.render = function(){

    return  '<span class="" style="font-weight: 700; font-size: 75%; padding: .2em .6em .3em;"> Total Participants: ' + this.countEnrolledUser + '</span><br>' +
            '<span class="" style="font-weight: 700; font-size: 75%; padding: .2em .1em .3em .6em;">Video:'+ '</span><span class="badge bg-green">' + this.countTotalVideo + '</span>' +
            '<span class="" style="font-weight: 700; font-size: 75%; padding: .2em .1em .3em .6em;">Pdf:' + '</span><span class="badge bg-green">' + this.countTotalPdf + '</span>' +
            '<span class="" style="font-weight: 700; font-size: 75%; padding: .2em .1em .3em .6em;">Discussion:' + '</span><span class="badge bg-green">' + this.countTotalDiscussion + '</span><br>';
};

module.exports = CourseListBasicStats;