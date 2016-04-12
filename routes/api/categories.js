var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Category = require(appRoot + '/modules/catalogs/category.controller.js');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');
var CategoryRecommend = require(appRoot + '/modules/catalogs/categoryRecommendation.model.js');
var debug = require('debug')('cm:route');
var router = express.Router();

var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');

var async = require('asyncawait/async');
var await = require('asyncawait/await');

router.get('/categories', function (req, res, next) {
    var cat = new Category();
    cat.getCategories(
        function (err) {
            res.status(500).json({});
        },
        // to get all categories in flat format
        {}
        ,
        function (categories) {
            res.status(200).json({categories: categories});
        }
    );
});

router.get('/category/:category/courseTags', function (req, res, next) {
    var cat = new Category();
    cat.getCategoryTags(
        function (err) {
            res.status(500).json({});
        },
        {
            _id: req.params.category
        }
        ,
        function (tags) {
            res.status(200).json({courseTags: tags});
        }
    );
});

/**
 * get courses based on category id
 * return: json
 */
router.get('/category/:category/courses', function (req, res, next) {
    var getCParam = {category: req.params.category, $or: [{isDeleted: {$exists: false}}, {isDeleted: false}]};

    // converting tag ids csv into tag (object ids)
    var tags = req.query.tags;
    if (tags) {
        tags = tags.split(',');
        if (tags.length > 0) {
            for (var i in tags)
                tags[i] = mongoose.Types.ObjectId(tags[i]);

            getCParam.courseTags = {$in: tags};
        }
    }

    var limit = 12;
    if (req.query['limit']) {
        var limitTemp = parseInt(req.query['limit']);
        if (limitTemp != NaN)
            limit = limitTemp;
    }

    var orderBy = -1;
    if (req.query['orderBy'])
        orderBy = req.query['orderBy'];

    var sortBy = 'dateAdded';
    if (req.query['sortBy'])
        sortBy = req.query['sortBy'];

    var lastPage = false;
    if (req.query['lastPage'])
        lastPage = parseInt(req.query['lastPage']);

    var pageParams = {
        lastPage: lastPage,
        limit: limit,
        sortBy: sortBy,
        orderBy: parseInt(orderBy)
    };

    var cat = new Course();
    cat.getCourses(
        function (err) {
            res.status(500).json({result: false, errors: err});
        },
        getCParam,
        pageParams,
        function (courses) {
            res.status(200).json({result: true, courses: courses});
        }
    );
});

router.get('/categories/recommendations', function (req, res, next) {
    // check for user rights, only admin can edit cats positions on the homepage
    if (!req.user || (req.user && req.user.role != 'admin')) {
        res.status(401).send('Unauthorized');
        return;
    }

    var job = async(function () {
        var recs = await(
            CategoryRecommend
                .find()
                .populate('user', 'username displayName')
                .exec());
        return recs;
    });

    job().then(function (categories) {
            if (categories)
                res.status(200).json({result: true, categories: categories});
            else
                res.status(200).json({result: true, category: []});
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

router.get('/category/:category', function (req, res, next) {
    var cat = new Category();
    cat.getCategory(
        function (err) {
            res.status(500).json({result: false, errors: err});
        },
        {
            slug: req.params.category
        }
        ,
        function (categories) {
            if (categories)
                res.status(200).json({result: true, category: categories});
            else
                helper.resReturn(helper.createError404('Category'), res);
        }
    );
});

/**
 * update category.positionFromRoot value
 */
router.put('/category/:category/positionFromRoot', function (req, res, next) {
    // check for user rights, only admin can edit cats positions on the homepage
    if (!req.user || (req.user && req.user.role != 'admin')) {
        res.status(401).send('Unauthorized');
        return;
    }

    var cat = new Category();

    cat.updateCategoryPosition(
        function (err) {
            res.status(500).json({});
        },
        {
            slug: req.params.category
        }
        ,
        {
            x: req.body.x,
            y: req.body.y
        },
        function (cat) {
            res.status(200).json({category: cat});
        }
    );
});


/**
 * update category.positionFromRoot value
 */
router.put('/category/:categoryId', function (req, res, next) {
    // check for user rights, only admin can edit cats positions on the homepage
    if (!req.user || (req.user && req.user.role != 'admin')) {
        res.status(401).send('Unauthorized');
        return;
    }

    try {
        req.params.categoryId = mongoose.Types.ObjectId(req.params.categoryId);
    } catch (exc) {
        helper.createError('wrong category id format', 500);
        return;
    }

    var cat = new Category();

    cat.updateCategory(
        function (err) {
            res.status(500).json({
                result: false,
                errors: err
            });
        },
        {
            _id: req.params.categoryId
        }
        ,
        req.body,
        function (cat) {
            res.status(200).json({
                result: true
            });
        }
    );
});

/**
 * save category into mongo
 */
router.post('/categories', function (req, res, next) {
    if (req.user && req.user.role != 'admin') {
        res.status(401).send('Unauthorized');
    }
    else {
        var cat = new Category();
        cat.addCategory(
            function (err) {
                res.status(500).json({result: false, errors: err});
            },

            // parameters
            req.body,

            function (cat) {
                res.status(200).json({result: true, category: cat});
            }
        );
    }
});

router.post('/categories/recommend', function (req, res, next) {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    req.body.user = mongoose.Types.ObjectId(req.user._id);

    var job = async(function () {
        var cat = new CategoryRecommend(req.body);
        await(cat.save());

        return cat;
    });

    job()
        .then(function (cat) {
            res.status(200).json({result: ((cat) ? true : false)});
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

//delete a category
router.delete('/category/:categoryId', function (req, res, next) {
    // check for user rights, only admin can delete cats positions on the homepage
    if (!req.user || (req.user && req.user.role != 'admin')) {
        res.status(401).send('Unauthorized');
        return;
    }

    try {
        req.params.categoryId = mongoose.Types.ObjectId(req.params.categoryId);
    } catch (exc) {
        helper.createError('wrong category id format', 500);
        return;
    }

    var cat = new Category();

    cat.deleteCategory(
        function (err) {
            res.status(500).json({
                result: false,
                errors: err
            });
        },
        req.params,
        function (cat) {
            res.status(200).json({result: true});
        }
    );
});

router.delete('/categories/recommendation/:categoryId', function (req, res, next) {
    // check for user rights, only admin can delete cats positions on the homepage
    if (!req.user || (req.user && req.user.role != 'admin')) {
        res.status(401).send('Unauthorized');
        return;
    }

    try {
        req.params.categoryId = mongoose.Types.ObjectId(req.params.categoryId);
    } catch (exc) {
        helper.createError('wrong category id format', 500);
        return;
    }

    var job = async(function () {
        var re = await(
            CategoryRecommend
                .findOneAndRemove({_id: req.params.categoryId}).exec());

        return re;
    });

    job()
        .then(function (re) {
            res.status(200).json({result: re});
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
});

module.exports = router;
