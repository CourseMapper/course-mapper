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
    actionSubject: { type: String},
    actionType : { type: String},
    dateAdded: {type: Date}
});

var newsfeedAgg = mongoose.model('newsfeed', newsfeedSchema);

module.exports = newsfeedAgg;