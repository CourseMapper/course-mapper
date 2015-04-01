var express = require('express');
var config = require('config');
var appRoot = require('app-root-path');
var Catalog = require(appRoot + '/modules/catalogs');

var router = express.Router();

function listCategories(req, res, next){
  res.render(config.get('theme') + '/catalogs/courses', { title: 'Browse for Courses' });
}

router.get('/catalogs', listCategories);
router.get('/catalogs/courses', listCategories);

router.get('/api/catalogs/categories', function(req, res, next) {
  var cat = new Catalog();
  cat.getCategories(
      function(err){
        res.status(500);
      },
      {

      },
      function(categories){
        res.status(200).json({categories: categories});
      }
  );
});

router.get('/api/catalogs/courses', function(req, res, next) {
  var cat = new Catalog();
  cat.getCourses(
      function(err){
        res.status(500);
      },
      {

      },
      function(courses){
        res.status(200).json({courses: courses});
      }
  );
});

router.get('/catalogs/:courseSlug', function(req, res, next) {
    res.render(config.get('theme') + '/catalogs/course', { title: req.params.courseSlug });
});

module.exports = router;