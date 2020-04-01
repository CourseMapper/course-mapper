/*
 courseId
 childrens
 positionFromRoot
 createdBy
 dateAdded
 dateUpdated
 type{'subTopic', 'content'}
 resourceIds[]
 description
 thumbnail
 name
 isDeleted*/

var mongoose = require('mongoose');

var treeNodesSchema = new mongoose.Schema({
    courseId: {type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true},
    parent: {type: mongoose.Schema.Types.ObjectId},
    childrens: [{type: mongoose.Schema.Types.ObjectId}],
    positionFromRoot: mongoose.Schema.Types.Mixed,
    //type{'subTopic', 'contentNode'}
    type: {type: String, required: true, default: "subTopic"},
    resources: [{type: mongoose.Schema.Types.ObjectId, ref: 'resources'}],
    name: {type: String},
    description: {type: String},
    settings: {type: mongoose.Schema.Types.Mixed},
    tabsActive: {type: mongoose.Schema.Types.Mixed},
    isDeleted: {type: Boolean, required: true, default: false},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
    dateAdded: {type: Date},
    dateUpdated: {type: Date},
    dateDeleted: {type: Date},
    isPrivate: {type: Boolean}
}, {
    usePushEach: true
});

// Define indexes
// treeNodesSchema.index(
//     {name: 'text'}, {
//         name: 'best_match_name',
//         weights: {name: 1}
//     }
// );
treeNodesSchema.index({name: 'text'});

treeNodesSchema.pre('save', function (next) {
    var now = new Date();
    if (!this.dateAdded) {
        this.dateAdded = now;
    }
    this.dateUpdated = now;
    next();
});

treeNodesSchema.pre('update', function (next) {
    this.dateUpdated = new Date();
    next();
});

var TreeNodes = mongoose.model('treeNodes', treeNodesSchema);

TreeNodes.ensureIndexes();
// TreeNodes.on('index', function(err){
//   console.log("TreeNodes: " + err);
// });

module.exports = TreeNodes;