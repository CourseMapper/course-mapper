var mongoose = require('mongoose');
var slug = require('slug');

var tagSchema = new mongoose.Schema({
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

    totalRelation: {type: Number, default: 0},
    dateAdded: { type: Date },
    dateUpdated: { type: Date }
}, {
    usePushEach: true
});

tagSchema.methods.setSlug = function(tagString) {
    this.slug = slug(tagString);
};

tagSchema.pre('save', function(next){
    var now = new Date();

    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }

    this.dateUpdated = now;
    next();
});

var CourseTag = mongoose.model('courseTags', tagSchema);

module.exports = CourseTag;