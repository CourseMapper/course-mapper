var mongoose = require('mongoose');

var categoryRecommend = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'users'
    },
    description: {type: String},
    dateAdded: {type: Date},
    dateUpdated: {type: Date}
}, {
    usePushEach: true
});


categoryRecommend.pre('save', function (next) {
    var now = new Date();

    if (!this.dateAdded) {
        this.dateAdded = now;
    }

    this.dateUpdated = now;

    next();
});

var catRec = mongoose.model('categoryRecommends', categoryRecommend);

module.exports = catRec;