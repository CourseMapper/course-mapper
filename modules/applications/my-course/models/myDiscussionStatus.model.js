var mongoose = require('mongoose');

var myDiscussionStatusSchema = new mongoose.Schema();
myDiscussionStatusSchema.set('usePushEach', true);

myDiscussionStatusSchema.add({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },

    discussionId: {
        type: mongoose.Schema.Types.ObjectId
    },

    type: {type: String},

    isDeleted: Boolean
});


var myDiscussionStatus = mongoose.model('my-course-myDiscussionStatus', myDiscussionStatusSchema);

module.exports = myDiscussionStatus;