var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var moment = require ('moment');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
//var TreeNodes = require(appRoot + '/modules/trees/treeNodes.js');
var UserCourses = require(appRoot + '/modules/catalogs/userCourses.js');

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

    if (countEnrolledUser) {
        self.countEnrolledUser = countEnrolledUser;
    } else {
        self.countEnrolledUser = 0;
    }
});

CourseListBasicStats.prototype.render = function(){

    return '<span class="label label-info bg-green"> Total enrolled participants: <b>' + this.countEnrolledUser + '</span> <br>';
};

module.exports = CourseListBasicStats;