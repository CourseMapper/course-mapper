var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Users = require(appRoot + '/modules/accounts/users.js');

function CourseListAuthor(){
}

CourseListAuthor.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.cid);
};

CourseListAuthor.prototype.run = async ( function(){
    var self = this;

    var result = await( Courses.findOne({
        _id: self._id
    }).exec());


    self.result = result;

    var user = await (Users.findOne({
        _id: this.result.createdBy
    }).exec());

    self.user = user;
} );

CourseListAuthor.prototype.render = function(){

    return '<span class="label label-info"> Author:' + this.user.displayName + '</span>';
};

module.exports = CourseListAuthor;
