var mongoose = require('mongoose');
var slug = require('slug');

var personalSchema = new mongoose.Schema();
personalSchema.set('usePushEach', true);
/**
 * Schema for maintaining users list of posts in their personal space
 */
personalSchema.add({
    userId: {type: mongoose.Schema.Types.ObjectId, required: true},
    courseId: {type: mongoose.Schema.Types.ObjectId, required: true},
    postId: {type: mongoose.Schema.Types.ObjectId},
    contentId: {type: mongoose.Schema.Types.ObjectId, required: true},
    title: {type: String, required: true},
    url: {type: String, required: true},
    type: {type: String, required: true},
    favicon: {type: String},
    hostName: {type: String},
    image: {type: String},
    embedHtml: {type: String},
    description: {type: String},
    dateAdded: {type: Date},
    tags: [{type: String}]
});

personalSchema.index({ title: 'text', description: 'text', tags: 'text', url: 'text' });

var per = mongoose.model('personalHub', personalSchema);

module.exports = per;

