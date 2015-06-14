var mongoose = require('mongoose');
var shortid = require('shortid');

var Tag = require('./courseTags.js');

var courseSchema = new mongoose.Schema({
    shortId:{
        type: String,
        unique: true,
        default: shortid.generate
    },
    name: {
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