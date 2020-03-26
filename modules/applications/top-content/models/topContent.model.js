var mongoose = require('mongoose');

var topContentSchema = new mongoose.Schema();
topContentSchema.set('usePushEach', true);

topContentSchema.add({

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
    nodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'treeNodes'
    },
    contentId : {
        type: mongoose.Schema.Types.ObjectId
    },
    contentName : {type: String},
    contentType : {type: String},
    countType : { type: String},
    count : {type: Number},
    isDeleted: Boolean
});

var topContentAgg = mongoose.model('topContent', topContentSchema);

module.exports = topContentAgg;