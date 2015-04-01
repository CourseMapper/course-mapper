var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    category: {
        type: String,
        unique: true,
        required: true
    },
    subCategories: [String],// type of this categorySchema
    updatedAt: { type: Date }
});

categorySchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

var Category = mongoose.model('categories', categorySchema);

module.exports = Category;