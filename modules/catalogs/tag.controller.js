var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
var Tag = require('./courseTags.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');

function catalog(){
}

catalog.prototype.AddTagToCourse = function(error, tag, params, success){
    debug("finding Course");
    // if it has parent Course, lets add it as its child
    Course.findOne({_id: params.course},
        function (err, course) {
            if (err) {
                debug('cant find course');
                if (error)error(err);
            }
            else
                course.update({
                    $addToSet: {
                        courseTags: tag._id
                    }
                }, function(err, res){
                    if (err) {
                        debug('failed updated on linking a category');
                        if (error)error(err);
                    }
                        else if(success)success(tag);
                });
        });
};

catalog.prototype.addCourseTag = function(error, params, success){
    var self = this;

    var tag = null;
    // find one before creating the tag, and add to course or its category if the param provided
    Tag.findOne({name: params.name}).exec().then(function(tag){
        if(tag){
            if(params.category) {
                self.AddTagToCategory(error, tag, params, success);
            }

            if(params.course){
                self.AddTagToCourse(error, tag, params, success);
            }

            // success added the tag
            success(tag);
        } else {
            // create new tag, and then add the newly tag to course/category
            var tag = new Tag({
                name: params.name
            });

            tag.setSlug(params.name);
            tag.save(function (err) {
                if (err) {
                    debug('saving tag error');
                    error(err);
                } else {
                    // the tag is successfully saved, we branch out the thread
                    // to save it as the relation to the category
                    if(params.category) {
                        self.AddTagToCategory(null, tag, params, null);
                    }

                    if(params.course){
                        self.AddTagToCourse(null, tag, params, null);
                    }

                    // but we just gonna send the response to the user now before the category transaction finish.
                    // success saved the tag
                    success(tag);
                }
            });
        }
    });
};

catalog.prototype.AddTagToCategory = function(error, tag, params, success){
    debug("finding Category");
    // if it has parent category, lets add it as its child
    Category.findOne({_id: params.category},
        function (err, cat) {
            if (err) {
                debug('error finding category');
                if(error) error(err);
            }
            else if(cat)
                cat.update({
                    $addToSet: {
                        courseTags: mongoose.Types.ObjectId(tag.id)
                    }
                }, function(err, res){
                    if (err){
                        debug('failed updated on linking a category');
                        if(error) error(err);
                    }
                    else if(success) success(tag);
                });
        });
};

/**
 * get tags by course
 * @param error
 * @param params
 * @param success
 */
catalog.prototype.getCourseTags = function(error, params, success){
    Tag.find(params, function(err, docs) {
        if (!err){
            success(docs);
        } else {
            error(err);
        }
    });
};

module.exports = catalog;