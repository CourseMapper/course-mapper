var mongoose = require('mongoose');

var peerReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
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
    dateAdded: { type: Date },
    dateUpdated: { type: Date }
});

peerReviewSchema.pre('save', function(next){
    var now = new Date();

    if (!this.publicationDate) {
        this.publicationDate = now;
    }

    if (!this.dueDate) {
        this.dueDate = now;
    }

    if (!this.solutionPublicationDate) {
        this.solutionPublicationDate = now;
    }

    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }

    this.dateUpdated = now;

    next();
});

var PeerReview = mongoose.model('peerreviews', peerReviewSchema);

module.exports = PeerReview;