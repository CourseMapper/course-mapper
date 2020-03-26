var mongoose = require('mongoose');
var appRoot = require('app-root-path');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');

var solutionsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    solutionDocuments: [{ type: String }],
    studentComments: { type: String },
    studentName: { type: String },
    isSubmitted: { type: Boolean },
    peerReviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'peerreviews', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    dateAdded: { type: Date },
    dateUpdated: { type: Date }
}, {
    usePushEach: true
});

solutionsSchema.pre('save', function(next){
    var now = new Date();

    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }

    this.dateUpdated = now;

    userHelper.isEnrolledAsync({userId: this.createdBy, courseId: this.courseId})
        .then(function (isAllowd) {
            if(!isAllowd) {
                var err = new Error('You dont have rights to enter a solution for this peer review')
                next(err);
            } else {
                next();
            }
        });
});

var Solution = mongoose.model('solutions', solutionsSchema);

module.exports = Solution;