var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
var CourseController = require('./course.controller.js');
var Tag = require('./courseTags.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');

function catalog(){
}

function convertToDictionary(documents){
    var ret = {};
    for(var i in documents){
        var doc = documents[i];
        ret[doc._id] = doc.toObject({ getters: true, virtuals: false });
    }

    return ret;
}

catalog.prototype.getCategories = function(error, params, success){
    Category.find(params, function(err, docs) {
        if (!err){
            var cats = convertToDictionary(docs);

            var parent = 'parentCategory';
            var children = 'subCategories';

            var tree = [];

            function again(cat){
                if(cat[children]){
                    var childrens = [];
                    for(var e in cat[children]){
                        var catId = cat[children][e];
                        var childCat = cats[catId];
                        childrens.push(childCat);
                        again(childCat);
                    }

                    cat[children] = childrens;
                }
            }

            for(var i in cats){
                // get the root
                var doc = cats[i];
                if(!doc[parent]){
                    again(doc);
                    tree.push(doc);
                }
            }

            success(tree);
        } else {
            error(err);
        }
    });
};

catalog.prototype.getCategory = function(error, params, success){
    Category.findOne(params)
        .populate('subCategories courseTags').exec(function(err, docs) {
            if (!err){
                success(docs);
            } else {
                error(err);
            }
        });
};

catalog.prototype.updateCategoryPosition = function(error, paramsWhere, paramsUpdate, success){
    Category.findOne(paramsWhere).exec(function(err, cat){
        if(err) error(err);
        else
            cat.update({
                $set: {
                    positionFromRoot: {
                        x: paramsUpdate.x,
                        y: paramsUpdate.y
                    }
                }
            }, function(err){
                if (err) {
                    debug('failed update cat position');
                    error(err);
                }
                else
                // success saved the cat
                    success(cat);
            });
    });
};

/**
 * get courseTags that belong to this category
 * @param error
 * @param params
 * @param success
 */
catalog.prototype.getCategoryTags = function(error, params, success){
    this.getCategory(error, params, function(docs){
        if(docs && docs.courseTags)
            success(docs.courseTags);
        else
            success([]);
    });
};

catalog.prototype.addCategory = function(error, params, success){

    var cat = new Category({
        name: params.name,
        parentCategory: params.parentCategory,
        subCategories: [],
        positionFromRoot: {
            x: 100,
            y: 70
        }
    });

    cat.setSlug(params.name);

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


module.exports = catalog;