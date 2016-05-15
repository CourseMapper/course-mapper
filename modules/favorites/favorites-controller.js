'use strict';
var FavoriteCourses = require('../../modules/favorites/favorite-courses');

var getAll = function (req, res, next) {
  if (!req.user) return res.status(400).json();

  FavoriteCourses
    .find({user: req.user._id, isFavorite: true})
    .populate('course')
    .exec(function (err, courses) {
      if (err) {
        return res.json([]);
      }
      return res.json(courses || []);
    });
};

var getByCourseId = function (req, res, next) {
  if (!req.user) return res.status(400).json();

  FavoriteCourses
    .findOne({user: req.user._id, course: req.params.cid})
    .exec(function (err, course) {
      if (err) {
        return res.status(500).json();
      }
      var isFavorite = course ? course.isFavorite : false;
      return res.json({isFavorite: isFavorite});
    });
};

var toggleFavorite = function (req, res, isFavorite) {
  if (!req.user || !req.params.cid) {
    return res.status(400).json();
  }

  var favorite = {
    course: req.params.cid,
    user: req.user._id,
    isFavorite: isFavorite
  };

  FavoriteCourses.update({course: req.params.cid}, favorite, {upsert: true}, function (err, data) {
    return res.status(204).json();
  });
};

var add = function (req, res, next) {
  toggleFavorite(req, res, true);
};

var remove = function (req, res, next) {
  toggleFavorite(req, res, false);
};

module.exports = {
  getAll: getAll,
  getByCourseId: getByCourseId,
  add: add,
  remove: remove
};