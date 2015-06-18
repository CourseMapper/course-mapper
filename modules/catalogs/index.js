var config = require('config');
var Category = require('./categories.js');
var Course = require('./courses.js');
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

catalog.prototype.getCourse = function(error, params, success){
    Course.findOne(params)
        .populate('createdBy category courseTags').exec(function(err, docs) {
            if (!err){
                success(docs);
            } else {
                error(err);
            }
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

catalog.prototype.addCourseTag = function(error, params, success){
    if(!params.category)
        params.category = null;

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
            // but we just gonna send the response to the user now before the category transaction finish.
            if(params.category) {
                console.log("finding Category");
                // if it has parent category, lets add it as its child
                Category.findOne({slug: params.category},
                    function (err, cat) {
                        if (err)
                            debug('cant find linked cat');
                        else
                            cat.update({
                                $addToSet: {
                                    courseTags: mongoose.Types.ObjectId(tag.id)
                                }
                            }, function(err, res){
                                if (err)
                                    debug('failed updated on linking a category');
                            });
                    });
            }

            // success saved the tag
            success(tag);
        }
    });
};


/**
 *
 * @param err
 * @param userParam
 * @param courseParam
 * @param done
 */
catalog.prototype.enroll = function(err, userParam, courseParam, done){
    var user = null;
    var course = null;

    /* find user first see if it exist */
    var userPromise = User.findById(mongoose.Types.ObjectId(userParam.id)).exec();
    userPromise.then(function(u){
        user = u;
        //{shortId:courseParam.shortId}
        return Course.findOne(courseParam).exec();

    }).then(function(c){
        /* find course see if it exist */
        course = c;
        return UserCourse.find({userId: user._id, courseId: course._id}).exec();

    }).then(function(uc){
        /* user has not follow this course */
        if(!uc.length){
            var follow = new UserCourse({
                userId: user._id,
                courseId: course._id
            });

            follow.save(function(error, f){
                if (error) err(error);
                else done(f);
            });
        } else {
            err(new Error('This user has followed this course already'));
        }
    });
};

catalog.prototype.addCourse = function(error, params, success){
    var self = this;

    if(!params.category) {
        throw new Error("please give category parameter");
    }

    if(!params.name) {
        throw new Error("please give name parameter");
    }

    // find the category first
    Category.findOne({slug: params.category},
        function (err, cat) {
            if (err) {
                debug('Cannot find category when adding course');
                error(err);
            }
            else if(cat){
                var course = new Course({
                    name: params.name,
                    createdBy: mongoose.Types.ObjectId(params.userId),
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

/**
 * get course tags
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