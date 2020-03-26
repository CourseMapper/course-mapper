var mongoose = require('mongoose');

var myPDFStatusSchema = new mongoose.Schema();
myPDFStatusSchema.set('usePushEach', true);

myPDFStatusSchema.add({
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

    pageNumber: {type: Number},

    totalPage: {type:Number},

    dateAdded: { type: Date },
    dateUpdated: { type: Date }
});


myPDFStatusSchema.pre('save', function(next){
    var now = new Date();
    this.dateUpdated = now;
    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }
    next();
});

myPDFStatusSchema.pre('update', function(next){
    this.dateUpdated = new Date();
    next();
});

var myPDFStatus = mongoose.model('my-course-myPDFStatus', myPDFStatusSchema);

module.exports = myPDFStatus;