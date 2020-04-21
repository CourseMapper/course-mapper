var mongoose = require('mongoose');
var slug = require('slug');
var hubSchema = new mongoose.Schema();
var commentSchema = new mongoose.Schema();
hubSchema.set('usePushEach', true);
commentSchema.set('usePushEach', true);

commentSchema.add({
    commentId: {type: mongoose.Schema.Types.ObjectId},
    dateAdded: { type: Date },
    dateRemoved: { type: Date },
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    authorDisplayName: { type: String, required: true },
    text: { type: String, required: true }
});

commentSchema.pre('save', function (next) {
    var now = new Date();
    if (!this.dateAdded) {
        this.dateAdded= now;
    }
    next();
});

/**
 * Hub Schema - schema for the post
 */
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
    totalVotes: {type: Number, default: 0},
    dateAdded: {type: Date},
    dateUpdated: {type: Date},
    personalUsers: [ {
        userId:{type: mongoose.Schema.Types.ObjectId}
    }],
    comments: [commentSchema],
    tags: [{type: String}],
    slug: {type: String}
});

/**
 * Set index for searching purposes
 */
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
agg.comments = mongoose.model('hub-comment', commentSchema);
agg.posts.ensureIndexes();
// agg.posts.on('index', function(err){
//   console.log("agg.posts: " + err);
// });
module.exports = agg;
