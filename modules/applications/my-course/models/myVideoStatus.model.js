var mongoose = require('mongoose');

var myVideoStatusSchema = new mongoose.Schema();
myVideoStatusSchema.set('usePushEach', true);

myVideoStatusSchema.add({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
  courseId: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},
  nodeId: {type: mongoose.Schema.Types.ObjectId, ref: 'treeNodes'},
  resourceId: {type: mongoose.Schema.Types.ObjectId, ref: 'resources'},
  totalTime: {type: Number},
  currentTime: {type: Number},
  dateAdded: {type: Date},
  dateUpdated: {type: Date}
});


myVideoStatusSchema.pre('save', function (next) {
  var now = new Date();
  this.dateUpdated = now;
  if (!this.dateAdded) {
    this.dateAdded = now;
  }
  next();
});

myVideoStatusSchema.pre('update', function (next) {
  this.dateUpdated = new Date();
  next();
});

var myVideoStatus = mongoose.model('myVideoStatus', myVideoStatusSchema);

module.exports = myVideoStatus;