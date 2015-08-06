var mongoose = require('mongoose');
var slug = require('slug');

var postSchema = new mongoose.Schema();

postSchema.add({
    title: {
        type: String,
        unique: true,
        required: true
    },

    slug: {
        type: String,
        required: true
    },

    content: {type: String},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},

    parentPost: {type: mongoose.Schema.Types.ObjectId, ref: 'posts'},
    // for level more than 1st
    parentPath: [{type: mongoose.Schema.Types.ObjectId, ref: 'posts'}],
    childPosts: [{type: mongoose.Schema.Types.ObjectId, ref: 'posts'}],

    isDeleted: Boolean,
    totalPosts: Number,
    totalViews: Number,

    dateAdded: { type: Date },
    dateUpdated: { type: Date }
});

postSchema.methods.setSlug = function(s) {
    this.slug = slug(s);
};

postSchema.pre('save', function(next){
    var now = new Date();
    this.dateUpdated = now;
    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }
    next();
});

postSchema.pre('update', function(next){
    this.dateUpdated = new Date();
    next();
});

var postSchemaI = mongoose.model('posts', postSchema);

module.exports = postSchemaI;
