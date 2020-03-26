var mongoose = require('mongoose');

var widgetSchema = new mongoose.Schema({
    application: {type: String, required: true},
    applicationName: {type: String},

    name: {type: String, required: true},
    location: {type: String},
    description: {type: String},
    entryPoint: {type: String, required: true},
    widgetJavascript: {type: mongoose.Schema.Types.Mixed},
    width: {type: Number},
    height: {type: Number},
    icon: {type: String},
    runOn: {type: String},
    controller: {type: String},
    hasConfigButton: {type: Boolean},

    allowMultipleInstallation: {type: Boolean, required: true, default:false},
    isActive: {type: Boolean, required: true, default:false},

    dateAdded: {type: Date},
    dateUpdated: {type: Date}
}, {
    usePushEach: true
});

widgetSchema.index({name: 1, application: 1}, {unique: true});

widgetSchema.pre('save', function (next) {
    var now = new Date();
    this.dateUpdated = now;
    if (!this.dateAdded) {
        this.dateAdded = now;
    }
    next();
});

widgetSchema.pre('update', function (next) {
    this.dateUpdated = new Date();
    next();
});

var Widget = mongoose.model('widgets', widgetSchema);

module.exports = Widget;
