var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
var Tag = require('./tags.js');
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
        .populate('subCategories tags').exec(function(err, docs) {
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
                    fromCenter: {
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

catalog.prototype.getCourse = function(error, params, success){
    Course.findOne(params)
        .populate('startedBy category tags').exec(function(err, docs) {
            if (!err){
                success(docs);
            } else {
                error(err);
            }
        });
};

catalog.prototype.getCategoryTags = function(error, params, success){
    this.getCategory(error, params, function(docs){
        success(docs.tags);
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
            var opts = {
                path: 'subCategories.subCategories',
                model: Category
            };
            Category.populate(docs, opts, function(err, docs){
                if (!err)
                    success(docs);
                else error(err);
            });
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

catalog.prototype.addTag = function(error, params, success){
    if(!params.category)
        params.category = null;

    var tag = new Tag({
        tag: params.tag
    });

    tag.setSlug(params.tag);

    tag.save(function (err) {
        if (err) {
            debug('save tag error');
            error(err);
        } else {
            if(params.category) {
                console.log("finding Category");
                // if it has parent category, lets add it as its child
                Category.findOne({slug: params.category},
                    function (err, cat) {
                        if (err) {
                            debug('cant find linked cat');
                            error(err);
                        }
                        else
                            cat.update({
                                $addToSet: {
                                    tags: mongoose.Types.ObjectId(tag.id)
                                }
                            }, function(err, res){
                                if (err) {
                                    debug('failed updated linked cat');
                                    error(err);
                                }
                                else {
                                    // success saved the tag
                                    success(tag);
                                }
                            });
                    });
            }
            else {
                // success saved the cat
                success(tag);
            }
        }
    });
};

catalog.prototype.addCourse = function(error, params, success){
    var self = this;

    if(typeof(params.category) != "undefined" && params.category != "undefined" && params.category) {
        //("finding Category");
        Category.findOne({slug: params.category},
            function (err, cat) {
                if (err) {
                    debug('cant find category when adding course');
                    error(err);
                }
                else if(cat && cat._id){
                    var course = new Course({
                        course: params.course,
                        startedBy: mongoose.Types.ObjectId(params.userId),
                        category: cat._id,
                        description: params.description
                    });

                    course.save(function(err, res) {
                        if (err) {
                            debug('failed saving new course');
                            error(err);
                        }
                        else {
                            // success saved the course
                            // find the newly saved course, and call the success Callback
                            self.getCourse(
                                error,
                                {_id: course._id},
                                function(crs){
                                    success(crs);
                                }
                            );
                        }
                    });
                }
                else {
                    error(new Error('cannot find category'));
                }
            });
    } else {
        error(new Error("please give correct parameter"));
    }
};

catalog.prototype.getCourses = function(error, params, success){
    Course.find(params, function(err, docs) {
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
 * @param params
 * @param success
 */
catalog.prototype.getCategoryCourses = function(error, params, success){
    var self = this;
    //get cat from slug
    var catPromise = Category.findOne({slug: params.slug}).exec();
    catPromise.then(function(cat){
        if(cat) {
            self.getCourses(error, {
                category: cat._id
            }, success);
        } else {
            throw new Error('cant find category');
        }
    }).then(null, function(err){
            error(err);
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