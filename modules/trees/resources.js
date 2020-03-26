/*
 resources
 type
 link
 dateAdded
 dateUpdated
 createdBy
 treeNodeId*/

var mongoose = require('mongoose');

var resourcesSchema = new mongoose.Schema({
  treeNodeId: {type: mongoose.Schema.Types.ObjectId, ref: 'treeNodes', required: true},
  courseId: {type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true},
  //type{'pdf', 'video'}
  type: {type: String, required: true},
  link: {type: String},
  isDeleted: {type: Boolean, required: true, default: false},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
  dateAdded: {type: Date},
  dateUpdated: {type: Date}
}, {
  usePushEach: true
});

resourcesSchema.pre('save', function (next) {
  var now = new Date();
  if (!this.dateAdded) {
    this.dateAdded = now;
  }
  this.dateUpdated = now;
  next();
});

var tn = mongoose.model('resources', resourcesSchema);

module.exports = tn;