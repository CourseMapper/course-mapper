var mongoose = require('mongoose');

var appSchema = new mongoose.Schema({
    app: {
        type: String,
        unique: true,
        required: true
    },

    isActive: {
        type: Boolean
    },

    updatedAt: { type: Date }
});

appSchema.pre('save', function(next){
    this.updatedAt = new Date();
    next();
});

var app = mongoose.model('apps', appSchema);

module.exports = app;