var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema();

categorySchema.add({
    category: {
        type: String,
        unique: true,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    parentCategory: mongoose.Schema.Types.ObjectId,
    subCategories: [categorySchema],// type of this categorySchema
    tags: [mongoose.Schema.Types.ObjectId],
    updatedAt: {
        type: Date
    }
});

categorySchema.methods.setSlug = function(tagString) {
    this.slug = slug(tagString);
};

categorySchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

var Category = mongoose.model('categories', categorySchema);

module.exports = Category;