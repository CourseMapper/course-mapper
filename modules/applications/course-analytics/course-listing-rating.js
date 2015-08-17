var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function CourseRating(){
}

CourseRating.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.nodeId);
};

CourseRating.prototype.run = async ( function(){
    var self = this;
    self.result = '';
} );

CourseRating.prototype.render = function(){
    return '<br>' +
        'Rating : <i class="fa fa-star"></i>' +
        '<i class="fa fa-star"></i>' +
        '<i class="fa fa-star"></i>' +
        '<i class="fa fa-star-half-o"></i>' +
        '<i class="fa fa-star-o"></i>'+
        '<br>';
};

module.exports = CourseRating;