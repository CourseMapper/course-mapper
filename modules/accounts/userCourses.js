/**
 * courses that are followed by a user
 */

var mongoose = require('mongoose');

var userCoursesSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    courseId: { type: String}
});

userCoursesSchema.index({ userId: 1, courseId: 1 }, { unique: true });

var UserCoursesSchema = mongoose.model('userCourses', userCoursesSchema);

module.exports = UserCoursesSchema;
