var mongoose = require('mongoose');
var shortid = require('shortid');

var Tag = require('./tags.js');

var courseSchema = new mongoose.Schema({
    _id: {
        type: String,
        unique: true,
        default: shortid.generate
    },
    course: {
        type: String,
        unique: true,
        required: true
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories'},
    updatedAt: { type: Date },
    tags:[{ type: mongoose.Schema.Types.ObjectId, ref: 'tags'}]
});

courseSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

var Course = mongoose.model('courses', courseSchema);

module.exports = Course;