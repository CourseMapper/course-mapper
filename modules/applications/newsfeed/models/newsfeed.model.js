var mongoose = require('mongoose');

var newsfeedSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    actionSubjectIds: {type: mongoose.Schema.Types.ObjectId},
    courseId: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},
    nodeId: {type: mongoose.Schema.Types.ObjectId, ref: 'treeNodes'},
    contentName: {type: String},
    actionSubject: {type: String},
    actionType: {type: String},
    actionName: {type: String},
    dateAdded: {type: Date},
    isSubjectDeleted: {type: Boolean, default: false}
  }, {
        usePushEach: true
    }
);

module.exports = mongoose.model('newsfeed', newsfeedSchema);