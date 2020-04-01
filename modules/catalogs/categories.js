var mongoose = require('mongoose');
var slug = require('slug');

var categorySchema = new mongoose.Schema();
categorySchema.set('usePushEach', true);

categorySchema.add({
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
  parentCategory: mongoose.Schema.Types.ObjectId,
  subCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories' }],
  positionFromRoot: mongoose.Schema.Types.Mixed,
  courseTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courseTags' }],
  dateAdded: { type: Date },
  dateUpdated: { type: Date }
});

// Define indexes
// categorySchema.index(
//   { name: 'text' }, {
//     name: 'best_match_name',
//     weights: { name: 1 }
//   });
categorySchema.index({ name: 'text' });

categorySchema.methods.setSlug = function (catString) {
  this.slug = slug(catString);
};

categorySchema.pre('save', function (next) {
  var now = new Date();
  this.dateUpdated = now;
  if (!this.dateAdded) {
    this.dateAdded = now;
  }
  next();
});

categorySchema.pre('update', function (next) {
  this.dateUpdated = new Date();
  next();
});

var Category = mongoose.model('categories', categorySchema);

Category.ensureIndexes();
// Category.on('index', function(err){
//   console.log("Category: " + err);
// });

module.exports = Category;
