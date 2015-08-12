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


myCreatedNodesSchema.pre('save', function(next){
    var now = new Date();
    this.dateUpdated = now;
    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }
    next();
});

myCreatedNodesSchema.pre('update', function(next){
    this.dateUpdated = new Date();
    next();
});

var myCreatedNodes = mongoose.model('my-course-myCreatedNodes', myCreatedNodesSchema);

module.exports = myCreatedNodes;