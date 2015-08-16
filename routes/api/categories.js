var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Category = require(appRoot + '/modules/catalogs/category.controller.js');
var Course = require(appRoot + '/modules/catalogs/course.controller.js');
var debug = require('debug')('cm:route');
var router = express.Router();

router.get('/categories', function(req, res, next) {
    var cat = new Category();
    cat.getCategories(
        function(err){
            res.status(500).json({});
        },
        // to get all categories in flat format
        {}
        ,
        function(categories){
            res.status(200).json({categories: categories});
        }
    );
});

router.get('/category/:category', function(req, res, next) {
    var cat = new Category();
    cat.getCategory(
        function(err){
            res.status(500).json({});
        },
        {
            slug: req.params.category
        }
        ,
        function(categories){
            res.status(200).json({category: categories});
        }
    );
});

/**
 * update category.positionFromRoot value
 */
router.put('/category/:category/positionFromRoot', function(req, res, next) {
    // check for user rights, only admin can edit cats positions on the homepage
    if (!req.user || (req.user && req.user.role != 'admin')) {
        res.status(401).send('Unauthorized');
        return;
    }

    var cat = new Category();

    cat.updateCategoryPosition(
        function(err){
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
        function(cat){
            res.status(200).json({category: cat});
        }
    );
});

router.get('/category/:category/courseTags', function(req, res, next) {
    var cat = new Category();
    cat.getCategoryTags(
        function(err){
            res.status(500).json({});
        },
        {
            _id: req.params.category
        }
        ,
        function(tags){
            res.status(200).json({courseTags: tags});
        }
    );
});

/**
 * get courses based on category id
 * return: json
 */
router.get('/category/:category/courses', function(req, res, next) {
    var getCParam = { category: req.params.category };

    // converting tag ids csv into tag (object ids)
    var tags = req.query.tags;
    if(tags) {
        tags = tags.split(',');
        if(tags.length > 0) {
            for (var i in tags)
                tags[i] = mongoose.Types.ObjectId(tags[i]);

            getCParam.courseTags = {$in: tags};
        }
    }

    var cat = new Course();
    cat.getCourses(
        function(err){
            res.status(500).json({errors:err});
        },
        getCParam
        ,
        function(courses){
            res.status(200).json({courses: courses});
        }
    );
});

/**
 * save category into mongo
 */
router.post('/categories', function(req, res, next){
    if (req.user && req.user.role != 'admin') {
        res.status(401).send('Unauthorized');
    }
    else {
        var cat = new Category();
        cat.addCategory(
            function (err) {
                res.status(500).json({result:false, errors: err});
            },

            // parameters
            req.body,

            function (cat) {
                res.status(200).json({result:true, category: cat});
            }
        );
    }
});

module.exports = router;
