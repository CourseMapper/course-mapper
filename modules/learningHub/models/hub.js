var mongoose = require('mongoose');
var slug = require('slug');

var hubSchema = new mongoose.Schema();

var commentSchema = new mongoose.Schema();


commentSchema.add({
    commentId: {type: mongoose.Schema.Types.ObjectId},
    date_created: { type: Date },
    date_removed: { type: Date },
    date_modified: { type: Date },
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    authorDisplayName: { type: String, required: true },
    text: { type: String, required: true }
});

commentSchema.pre('save', function (next) {
    var now = new Date();
    this.date_modified = now;
    if (!this.date_created) {
        this.date_created= now;
    }
    next();
});


commentSchema.pre('update', function (next) {
    var now = new Date();
    this.date_modified= now;
    next();
});

hubSchema.add({
    courseId: {type: mongoose.Schema.Types.ObjectId, required: true},
    postId: {type: mongoose.Schema.Types.ObjectId},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true},
    contentId: {type: mongoose.Schema.Types.ObjectId, required: true},
    title: {type: String, required: true},
    url: {type: String, required: true},
    type: {type: String, required: true},
    favicon: {type: String},
    hostName: {type: String},
    image: {type: String},
    embedHtml: {type: String},
    description: {type: String},
    isDeleted: {type: Boolean, required: true},
    dateAdded: {type: Date},
    dateUpdated: {type: Date},
    personalUsers: [ {
        userId:{type: mongoose.Schema.Types.ObjectId}
    }],
    comments: [commentSchema],
    tags: [{type: String}],
    slug: {type: String}
});

hubSchema.index({ title: 'text', description: 'text', tags: 'text', url: 'text' });

hubSchema.methods.setSlug = function (s) {
    this.slug = slug(s);
};


hubSchema.pre('save', function (next) {
    var now = new Date();
    this.dateUpdated = now;
    if (!this.dateAdded) {
        this.dateAdded = now;
    }
    next();
});


hubSchema.pre('update', function (next) {
    var now = new Date();
    this.dateUpdated = now;
    next();
});

var agg = {};
agg.posts = mongoose.model('hub', hubSchema);
module.exports = agg;
