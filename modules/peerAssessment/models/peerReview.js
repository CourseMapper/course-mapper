var mongoose = require('mongoose');

var peerReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: { type: String },
    documents: [{ type: String }],
    groupSubmission: { type: Boolean },
    totalMarks: {
        type: Number,
        required: true
    },
    publicationDate: { type: Date },
    dueDate: { type: Date },
    solutionPublicationDate: { type: Date },
    solutions: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true},
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true},
    reviewSettings: {
        loop: {
            type: String,
            enum: ['single','multiple']
        },
        reviewStartDate: { type: Date },
        reviewEndDate: { type: Date },
        secondDueDate: { type: Date },
        secondReviewStartDate: { type: Date },
        secondReviewEndDate: { type: Date },
        blind: {
            type: String,
            enum: ['single', 'double', 'none']
        },
        reviewAssignment: {
            type: String,
            enum: ['single','multiple']
        },
        studentPercentage: {
            type: Number,
            required: true
        },
        rubrics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'rubrics' }]
    },
    dateAdded: { type: Date },
    dateUpdated: { type: Date }
}, {
    usePushEach: true
});

peerReviewSchema.pre('save', function(next) {
    var now = new Date();

    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }

    this.dateUpdated = now;

    next();
});

var PeerReview = mongoose.model('peerreviews', peerReviewSchema);

module.exports = PeerReview;