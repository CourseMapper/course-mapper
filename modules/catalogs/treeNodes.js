/*
courseId
childrens
positionFromRoot
createdBy
dateAdded
dateUpdated
type{'subtopic', 'content'}
resourceIds[]
description
thumbnail
name
isDeleted*/

var mongoose = require('mongoose');
var slug = require('slug');
var Tag = require('./courseTags.js');

var courseSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    description: { type: String },
    picture: { type: String },
    video: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
    courseTags:[{ type: mongoose.Schema.Types.ObjectId, ref: 'courseTags'}],
    dateAdded: { type: Date },
    dateUpdated: { type: Date }
});

courseSchema.methods.setSlug = function(cString) {
    this.slug = slug(cString);
};

courseSchema.pre('save', function(next){
    var now = new Date();

    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }

    this.dateUpdated = now;

    next();
});

var Course = mongoose.model('courses', courseSchema);

module.exports = Course;