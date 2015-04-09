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
    category: mongoose.Schema.Types.ObjectId, // type of this categorySchema
    updatedAt: { type: Date },
    tags:[mongoose.Schema.Types.ObjectId]
});

courseSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

var Course = mongoose.model('courses', courseSchema);

module.exports = Course;