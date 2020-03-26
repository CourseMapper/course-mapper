var mongoose = require('mongoose');
var appRoot = require('app-root-path');

var rubricSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    dateAdded: { type: Date },
    dateUpdated: { type: Date }
}, {
    usePushEach: true
});

rubricSchema.pre('save', function(next){
    var now = new Date();

    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }

    this.dateUpdated = now;

    next()
});

var Rubric = mongoose.model('rubrics', rubricSchema);

module.exports = Rubric;