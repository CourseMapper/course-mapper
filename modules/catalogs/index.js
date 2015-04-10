var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
var Tag = require('./tags.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');

function catalog(){
}

catalog.prototype.getCategories = function(error, params, success){
    Category.find(params, function(err, docs) {
        if (!err){
            success(docs);
        } else {
            error(err);
        }
    });
};

/**
 *
 * @param error
 * @param parentId pass in string or number of object id
 * @param success
 */
catalog.prototype.getCategoriesRecursive = function(error, parentId, success){
    // param for the parent cats
    var param = {parentCategory: null};
    if(parentId)
        param = {_id: mongoose.Types.ObjectId(parentId)};

    // get the parent cats
    Category.find(param)
        // and populate sub cats
        .populate('subCategories').exec(function(err, docs){
        if (!err){
            success(docs);
        } else {
            error(err);
        }
    });
};

catalog.prototype.addCategory = function(error, params, success){
    if(!params.parentCategory)
        params.parentCategory = null;

    var cat = new Category({
        category: params.category,
        parentCategory: params.parentCategory,
        subCategories: []
    });

    cat.setSlug(params.category);

    cat.save(function (err) {
        if (err) {
            debug('save cat error');
            error(err);
        } else {
            if(params.parentCategory) {
                console.log("finding parent Category");
                // if it has parent category, lets add it as its child
                Category.findById(mongoose.Types.ObjectId(params.parentCategory),
                    function (err, parentCat) {
                        if (err) {
                            debug('cant find parent cat');
                            error(err);
                        }
                        else
                            parentCat.update({
                                $addToSet: {
                                    subCategories: mongoose.Types.ObjectId(cat.id)
                                }
                            }, function(err, subCat){
                                if (err) {
                                    debug('failed updated parent cat');
                                    error(err);
                                }
                                else
                                    // success saved the cat
                                    success(cat);
                            });
                    });
            }
            else {
                // success saved the cat
                success(cat);
            }
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

catalog.prototype.getTags = function(error, params, success){
    Tag.find({}, function(err, docs) {
        if (!err){
            success(docs);
        } else {
            error(err);
        }
    });
};

module.exports = catalog;