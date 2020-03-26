var mongoose = require('mongoose');

var myActivityStatusSchema = new mongoose.Schema();
myActivityStatusSchema.set('usePushEach', true);

myActivityStatusSchema.add({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },

    nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'treeNodes'
    },

    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'resources'
    },

    type: {type: String},

    isDeleted: Boolean
});




var myActivityStatus = mongoose.model('my-course-myActivityStatus', myActivityStatusSchema);

module.exports = myActivityStatus;