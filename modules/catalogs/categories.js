var mongoose = require('mongoose');
var slug = require('slug');

var categorySchema = new mongoose.Schema();

categorySchema.add({
    category: {
        type: String,
        unique: true,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    parentCategory: mongoose.Schema.Types.ObjectId,
    subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories'}],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tags'}],
    updatedAt: {
        type: Date
    }
});

categorySchema.methods.setSlug = function(catString) {
    this.slug = slug(catString);
};

categorySchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

categorySchema.pre('update', function(next){
    this.updatedAt = new Date();
    next();
});

var Category = mongoose.model('categories', categorySchema);

module.exports = Category;