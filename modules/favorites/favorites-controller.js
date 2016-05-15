'use strict';
var UserCourses = require('../../modules/catalogs/userCourses');

var getAll = function (req, res, next) {
  var query = {
    user: req.user._id,
    isFavorite: true
  };
  UserCourses.find(query).populate('course').exec(function (err, courses) {
    if (err) return res.json([]);
    return res.json(courses);
  });
};

var add = function (req, res, next) {
  var courseId = req.params.cid;
  var query = {courseId: courseId};

  UserCourses.findOne(query, function (err, course) {
    if (err) return next(err);
    if (!course) return res.status(404).json();

    course.isFavorite = true;
    course.save();

    return res.status(201).json();
  });
};

module.exports = {
  getAll: getAll,
  add: add
};