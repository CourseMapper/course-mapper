var mongoose = require('mongoose');

var myCreatedNodesSchema = new mongoose.Schema();

myCreatedNodesSchema.add({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    },

    nodeType: { type:String },

    treeNodeIds:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'treeNodes'
    }],

    dateAdded: { type: Date },
    dateUpdated: { type: Date }
});




var myCreatedNodes = mongoose.model('my-course-myCreatedNodes', myCreatedNodesSchema);

module.exports = myCreatedNodes;