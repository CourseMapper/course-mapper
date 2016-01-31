var mongoose = require('mongoose');

var newsfeedSchema = new mongoose.Schema();

newsfeedSchema.add({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    actionSubjectIds: {
        type: mongoose.Schema.Types.ObjectId
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
    nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'treeNodes'
    },
    contentName : {type: String},
    actionSubject: { type: String},
    actionType : { type: String},
    actionName : {type:String},
    dateAdded: {type: Date}
});

var newsfeedAgg = mongoose.model('newsfeed', newsfeedSchema);

module.exports = newsfeedAgg;