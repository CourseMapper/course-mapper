var mongoose = require('mongoose');
var slug = require('slug');

var tagSchema = new mongoose.Schema({
    tag: {
        type: String,
        unique: true,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    totalCourse: {type: Number, default: 0},
    updatedAt: { type: Date }
});

tagSchema.methods.setSlug = function(tagString) {
    this.slug = slug(tagString);
};

tagSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

var Tag = mongoose.model('tags', tagSchema);

module.exports = Tag;