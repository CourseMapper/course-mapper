var mongoose = require('mongoose');

var tabActiveSchema = new mongoose.Schema({
    orderNo: {type: Number},
    location: {type: String},
    tabId: {type: mongoose.Schema.Types.ObjectId, ref: 'tabs'},
    courseId: {type: mongoose.Schema.Types.ObjectId, ref: 'courses'},

    isActive: {type: Boolean, required: true, default: false},

    dateAdded: {type: Date},
    dateUpdated: {type: Date}
}, {
    usePushEach: true
});

tabActiveSchema.pre('save', function (next) {
    var now = new Date();
    this.dateUpdated = now;
    if (!this.dateAdded) {
        this.dateAdded = now;
    }
    next();
});

tabActiveSchema.pre('update', function (next) {
    this.dateUpdated = new Date();
    next();
});

var tab = mongoose.model('tabsActive', tabActiveSchema);

module.exports = tab;
