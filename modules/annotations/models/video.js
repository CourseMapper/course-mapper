var mongoose = require('mongoose');

var VideoSchema = new mongoose.Schema({
    date_created: {type: Date},
    date_modified: {type: Date},
    author: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: Number, required: true}
});

VideoSchema.pre('save', function (next) {
    var now = Date.now();
    if (!this.date_created) {
        this.date_created = now;
    }
    this.date_modified = now;
    next();
});

VideoSchema.pre('update', function (next) {
    this.date_modified = Date.now();
    next();
});

module.exports = mongoose.model('Video', VideoSchema);
