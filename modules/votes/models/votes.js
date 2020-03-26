var mongoose = require('mongoose');
var slug = require('slug');

var votesSchema = new mongoose.Schema();
votesSchema.set('usePushEach', true);

votesSchema.add({
    voteType: { type: String },
    voteTypeId: { type: mongoose.Schema.Types.ObjectId},
    voteValue: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    dateAdded: { type: Date },
    dateUpdated: { type: Date }
});

votesSchema.pre('save', function(next){
    var now = new Date();
    this.dateUpdated = now;
    if ( !this.dateAdded ) {
        this.dateAdded = now;
    }
    next();
});

votesSchema.pre('update', function(next){
    this.dateUpdated = new Date();
    next();
});

var disc = mongoose.model('votes', votesSchema);

module.exports = disc;
