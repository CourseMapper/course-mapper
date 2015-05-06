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
    description: {
        type: String
    },
    picture: {
        type: String
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true},
    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
    startedAt: { type: Date },
    updatedAt: { type: Date },
    tags:[{ type: mongoose.Schema.Types.ObjectId, ref: 'tags'}]
});

courseSchema.pre('save', function(next){
    var now = new Date();

    if ( !this.startedAt ) {
        this.startedAt = now;
    }

    this.updatedAt = now;

    next();
});

var Course = mongoose.model('courses', courseSchema);

module.exports = Course;