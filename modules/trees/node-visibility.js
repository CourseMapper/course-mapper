var mongoose = require('mongoose');

var nodeVisibilitySchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  node: {type: mongoose.Schema.Types.ObjectId, ref: 'treeNodes'},
  isHidden: {type: Boolean, default: false},
  createdAt: {type: Date},
  updatedAt: {type: Date}
}, {
  usePushEach: true
});

nodeVisibilitySchema.pre('save', function (next) {
  var now = new Date();
  if (!this.createdAt) {
    this.createdAt = now;
  }
  this.updatedAt = now;
  next();
});

nodeVisibilitySchema.pre('update', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('nodeVisibility', nodeVisibilitySchema);