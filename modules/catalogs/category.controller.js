var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
var CourseController = require('./course.controller.js');
var Tag = require('./courseTags.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');

var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');

function catalog() {
}

function convertToDictionary(documents) {
    var ret = {};
    for (var i in documents) {
        var doc = documents[i];
        ret[doc._id] = doc.toObject({getters: true, virtuals: false});
    }

    return ret;
}

/**
 * get all categories based on params,
 * and form the data into recursive tree
 *
 * @param error
 * @param params
 * @param success
 */
catalog.prototype.getCategories = function (error, params, success) {
    Category.find(params, function (err, docs) {
        if (!err) {
            var cats = convertToDictionary(docs);

            var parent = 'parentCategory';
            var children = 'subCategories';

            var tree = [];

            function again(cat) {
                if (cat && cat[children]) {
                    var childrens = [];
                    for (var e in cat[children]) {
                        var catId = cat[children][e];
                        var childCat = cats[catId];
                        childrens.push(childCat);
                        again(childCat);
                    }

                    cat[children] = childrens;
                }
            }

            for (var i in cats) {
                // get the root
                var doc = cats[i];
                if (!doc[parent]) {
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

catalog.prototype.getCategory = function (error, params, success) {
    Category.findOne(params)
        .populate('subCategories courseTags').exec(function (err, docs) {
        if (!err) {
            success(docs);
        } else {
            error(err);
        }
    });
};

catalog.prototype.updateCategoryPosition = function (error, paramsWhere, paramsUpdate, success) {
    Category.findOne(paramsWhere).exec(function (err, cat) {
        if (err) error(err);
        else
            cat.update({
                $set: {
                    positionFromRoot: {
                        x: paramsUpdate.x,
                        y: paramsUpdate.y
                    }
                }
            }, function (err) {
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


catalog.prototype.updateCategory = function (error, paramsWhere, paramsUpdate, success) {
    Category.findOne(paramsWhere).exec(function (err, cat) {
        if (err) error(err);
        else {
            if (paramsUpdate.name) {
                cat.setSlug(paramsUpdate.name);
                cat.save();
            }

            cat.update({
                $set: paramsUpdate
            }, function (err) {
                if (err) {
                    debug('failed update cat');
                    error(err);
                }
                else
                // success saved the cat
                    success(cat);
            });
        }
    });
};

catalog.prototype.deleteCategory = function (error, params, success) {
    var self = this;

    if (!helper.checkRequiredParams(params, ['categoryId'], error)) {
        return;
    }

    Category.findOne({_id: params.categoryId}, function (err, doc) {
        if (err) {
            error(err);
            return;
        }

        if (doc) {
            if (doc.parentCategory) {
                // remove from parent
                Category.findById(doc.parentCategory,
                    function (err, parentCat) {
                        if (err) {
                            debug('cant find parent cat');
                            error(err);
                            return;
                        }
                        if (parentCat) {
                            parentCat.update({
                                $pull: {
                                    subCategories: doc._id
                                }
                            }, function (err) {
                                if (err) {
                                    debug('failed updated parent cat');
                                }
                            });
                        }
                    });
            }

            if (doc.subCategories) {
                for (var i in doc.subCategories) {
                    var subCatId = doc.subCategories[i];
                    self.deleteCategory(function () {
                    }, {categoryId: subCatId}, function () {
                    });
                }
            }

            //remove this cat
            Category.remove({
                    _id: params.categoryId
                },
                function (err) {
                    if (err)
                        error(err);
                    else {
                        success();
                    }
                });
        }
    });
};

/**
 * get courseTags that belong to this category
 * @param error
 * @param params
 * @param success
 */
catalog.prototype.getCategoryTags = function (error, params, success) {
    this.getCategory(error, params, function (docs) {
        if (docs && docs.courseTags)
            success(docs.courseTags);
        else
            success([]);
    });
};

catalog.prototype.addCategory = function (error, params, success) {

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
            if (params.parentCategory) {
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
                            }, function (err, subCat) {
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