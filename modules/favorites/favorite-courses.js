'use strict';

var mongoose = require('mongoose');

var FavoriteCoursesSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  course: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},
  isFavorite: Boolean,
  dateAdded: {type: Date},
  dateUpdated: {type: Date}
}, {
  usePushEach: true
});

FavoriteCoursesSchema.index({user: 1, course: 1}, {unique: true});

FavoriteCoursesSchema.pre('save', function (next) {
  var now = new Date();
  if (!this.dateAdded) {
    this.dateAdded = now;
  }
  this.dateUpdated = now;
  next();
});

FavoriteCoursesSchema.pre('update', function (next) {
  this.dateUpdated = new Date();
  next();
});

module.exports = mongoose.model('favoriteCourses', FavoriteCoursesSchema);