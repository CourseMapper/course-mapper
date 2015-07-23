var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function CoursesStat(){
}

CoursesStat.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.cid);
};

CoursesStat.prototype.run = async ( function(){
    var self = this;

    var result = await( Courses.findOne({
        _id: self._id
    }).exec());

    self.result = result;
} );

CoursesStat.prototype.render = function(){
    return '<span>' + this.result.dateAdded + '<span>';
};

module.exports = CoursesStat;
