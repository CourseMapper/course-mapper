var mongoose = require('mongoose');
var slug = require('slug');

var courseLinkSchema = new mongoose.Schema();
courseLinkSchema.set('usePushEach', true);

courseLinkSchema.add({
    contentNode: {
        type: mongoose.Schema.Types.ObjectId, ref: 'treeNodes'
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'users'
    },
    slug: {type: String},
    title: {type: String, required: true},
    description: {type: String},
    content: {type: String, required: true},

    isDeleted: Boolean,
    totalVotes: {type: Number, default: 0},

    dateAdded: {type: Date},
    dateUpdated: {type: Date}
});
courseLinkSchema.methods.setSlug = function (s) {
    this.slug = slug(s);
};
courseLinkSchema.pre('save', function (next) {
    var now = new Date();
    this.dateUpdated = now;
    if (!this.dateAdded) {
        this.dateAdded = now;
    }
    next();
});

courseLinkSchema.pre('update', function (next) {
    this.dateUpdated = new Date();
    next();
});

var disc = mongoose.model('courseLinks', courseLinkSchema);

module.exports = disc;
