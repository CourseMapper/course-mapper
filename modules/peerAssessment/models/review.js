var mongoose = require('mongoose');
var appRoot = require('app-root-path');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');

var reviewSchema = new mongoose.Schema({
    marksObtained: { type: Number },
    comments: { type: String },
    documents: [{ type: String }],
    reviewDocuments: [{ type: String }],
    rubricReview:   mongoose.Schema.Types.Mixed,
    isSubmitted: { type: Boolean },
    isAdminReview : { type: Boolean },
    isSecondLoop : { type: Boolean },
    oldReviewId : { type: mongoose.Schema.Types.ObjectId, ref: 'reviews' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    solutionId: { type: mongoose.Schema.Types.ObjectId, ref: 'solutions', required: true },
    peerReviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'peerreviews', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    dateAdded: { type: Date },
    dateUpdated: { type: Date }
}, {
    usePushEach: true
});

reviewSchema.pre('save', function(next){
    var now = new Date();

    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }

    this.dateUpdated = now;

    next();
});

var Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;