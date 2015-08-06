var mongoose = require('mongoose');
var slug = require('slug');

var courseDiscussionSchema = new mongoose.Schema();

courseDiscussionSchema.add({
    course: {
        type: mongoose.Schema.Types.ObjectId, ref: 'courses'},

    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'users'},

    discussion: {
        type: mongoose.Schema.Types.ObjectId, ref: 'posts'},

    dateAdded: { type: Date },
    dateUpdated: { type: Date }
});

courseDiscussionSchema.pre('save', function(next){
    var now = new Date();
    this.dateUpdated = now;
    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }
    next();
});

courseDiscussionSchema.pre('update', function(next){
    this.dateUpdated = new Date();
    next();
});

var disc = mongoose.model('courseDiscussions', courseDiscussionSchema);

module.exports = disc;
