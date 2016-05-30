var appRoot = require('app-root-path');
//var mongoose = require('mongoose');
var Categories = require(appRoot + '/modules/catalogs/categories.js');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function CatCountSubNodes(){
}

CatCountSubNodes.prototype.init = function(params){
    this.slug = params.slug;
};

CatCountSubNodes.prototype.run = async ( function(){
    var self = this;

    var result = await( Categories.findOne({
        slug: self.slug
    }).exec());
    if (result._id) {
        var countAllCourses = await (Courses.find({category: result._id}).count().exec());
        var countDeletedCourses = await (Courses.find({category: result._id, isDeleted:{$exists: true}}).count().exec());
        var activeCourse = countAllCourses - countDeletedCourses;
    }
    //var catId = result._id;


    self.result = activeCourse;
} );


CatCountSubNodes.prototype.render = function(){
    var activeCourse = this.result;


    return '<div class="countCourses" style="font-size:80%; margin-top: 3px;"> <span class="badge bg-yellow"> Course Available: ' + activeCourse + '</span></div>' ;
};

module.exports = CatCountSubNodes;
