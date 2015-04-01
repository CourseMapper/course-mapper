var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');

function catalog(){
}

catalog.prototype.getCategories = function(error, params, success){
    Category.find({}, function(err, docs) {
        if (!err){
            success(docs);
        } else {
            error(err);
        }
    });
};

catalog.prototype.getCourses = function(error, params, success){
    Course.find({}, function(err, docs) {
        if (!err){
            success(docs);
        } else {
            error(err);
        }
    });
};

module.exports = catalog;