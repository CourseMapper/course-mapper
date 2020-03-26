/**
 * courses that are followed by a user
 */

var mongoose = require('mongoose');

var userCoursesSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  course: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},
  isEnrolled: Boolean,

  dateAdded: {type: Date},
  dateUpdated: {type: Date}
}, {
  usePushEach: true
});

userCoursesSchema.index({user: 1, course: 1}, {unique: true});

userCoursesSchema.pre('save', function (next) {
  var now = new Date();

  if (!this.dateAdded) {
    this.dateAdded = now;
  }

  this.dateUpdated = now;
  next();
});

userCoursesSchema.pre('update', function (next) {
  this.dateUpdated = new Date();
  next();
});

var UserCoursesSchema = mongoose.model('userCourses', userCoursesSchema);

module.exports = UserCoursesSchema;