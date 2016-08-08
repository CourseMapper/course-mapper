var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var moment = require ('moment');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var TreeNodes = require(appRoot + '/modules/trees/treeNodes.js');
var UserCourses = require(appRoot + '/modules/catalogs/userCourses.js');

function CourseListLatestActivity(){
}

CourseListLatestActivity.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.cid);
};

CourseListLatestActivity.prototype.run = async ( function(){
    var self = this;

    var content = await( TreeNodes.findOne({
        courseId: self._id,
        type: 'contentNode',
        isDeleted: 'false'
    }).sort({'dateAdded':-1}).exec());

    if (content) {
        self.content = content;
    } else {
        //self.content = "No content available";
        self.content = {dateUpdated: '', name:'No content available'};
    }


    var userEnrolled = await (UserCourses.findOne({
        course: self._id,
        isEnrolled: 'true'
    }).sort({'dateUpdated': -1}).populate('user').exec());

    //self.userEnrolled = userEnrolled;
    if (userEnrolled) {
        self.userEnrolled = userEnrolled;
    } else {
        self.userEnrolled = {user: {displayName:"No user enrolled"}};
    }

} );

CourseListLatestActivity.prototype.render = function(){
    var momentDate = moment(this.content.dateUpdated).format('MMMM Do YYYY');
    if (momentDate == "Invalid date") {
        momentDate = '';
    }
    return '<span class="label label-info"> Latest content: <b>' + this.content.name + '</b> - ' + momentDate + '</span> <br>' +
            '<span class="label label-info"> Last enrolled participant: ' + this.userEnrolled.user.displayName + '</span> <br>';
};

module.exports = CourseListLatestActivity;
