var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var moment = require ('moment');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function CourseListDateAdded(){
}

CourseListDateAdded.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.cid);
};

CourseListDateAdded.prototype.run = async ( function(){
    var self = this;

    var result = await( Courses.findOne({
        _id: self._id
    }).exec());

    self.result = result;
} );

CourseListDateAdded.prototype.render = function(){

    var momentDate = moment(this.result.dateAdded).format('MMMM Do YYYY');
    return '<span class="label label-info"> Created On: ' + momentDate + '</span> <br>';
};

module.exports = CourseListDateAdded;
