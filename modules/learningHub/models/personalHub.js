var mongoose = require('mongoose');
var slug = require('slug');

var personalSchema = new mongoose.Schema();

personalSchema.add({
    userId: {type: mongoose.Schema.Types.ObjectId, required: true},
    posts : [{
        courseId: {type: mongoose.Schema.Types.ObjectId, required: true},
        postId: {type: mongoose.Schema.Types.ObjectId},
        userId: {type: mongoose.Schema.Types.ObjectId, required: true},
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
        dateUpdated: {type: Date},
        tags: [{type: String}]
    }]

});

var per = mongoose.model('personalHub', personalSchema);


module.exports = per;

