var mongoose = require('mongoose');

var tabSchema = new mongoose.Schema({
    name: {type: String, required: true},
    orderNo: {type: Number},
    displayName: {type: String, required: true},
    ngShow: {type: String},
    location: {type: String},
    description: {type: String},
    icon: {type: String},
    isActive: {type: Boolean, required: true, default: false},
    isDefaultActivated: {type: Boolean, required: true, default: false},
    hasJsFiles: {type: Boolean, required: true, default: false},
    dateAdded: {type: Date},
    dateUpdated: {type: Date}
}, {
    usePushEach: true
});

tabSchema.pre('save', function (next) {
    var now = new Date();
    this.dateUpdated = now;
    if (!this.dateAdded) {
        this.dateAdded = now;
    }
    next();
});

tabSchema.pre('update', function (next) {
    this.dateUpdated = new Date();
    next();
});

var tab = mongoose.model('tabs', tabSchema);

module.exports = tab;
