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
    courseId: { type: mongoose.Schema.Types.ObjectId,  required: true },
    parent: { type: mongoose.Schema.Types.ObjectId },
    childrens: [{ type: mongoose.Schema.Types.ObjectId }],
    positionFromRoot: mongoose.Schema.Types.Mixed,

    //type{'subTopic', 'content'}
    type:{type:String, required:true, default:"subTopic"},
    resources:[{ type: mongoose.Schema.Types.ObjectId, ref: 'resources'}],

    name: {type:String},
    description: {type:String},

    isDeleted: {type:Boolean, required:true, default:true},

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},

    dateAdded: { type: Date },
    dateUpdated: { type: Date }
});

treeNodesSchema.pre('save', function(next){
    var now = new Date();

    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }

    this.dateUpdated = now;

    next();
});

treeNodesSchema.pre('update', function(next){
    this.dateUpdated = new Date();
    next();
});

var tn = mongoose.model('treeNodes', treeNodesSchema);

module.exports = tn;