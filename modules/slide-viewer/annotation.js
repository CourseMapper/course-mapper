var mongoose = require('mongoose');


var annotationPDFSchema = new mongoose.Schema({
    /*parentId: {
        type: Number,
        unique: true,
        required: true
    },*/
    //createdMarkups: {},
    rawText: {
        type: String,
        required: true
    },
    //renderedText: {},
    author: {
        type: String,
        required: true,
    },
    dateOfCreation: { type: Date },
    //votes: {},
    //isDeleted: {},
    originSlide: { type: Number }
});

annotationPDFSchema.pre('save', function(next){
    this.dateOfCreation = new Date();
    next();
});

annotationPDFSchema.methods.setRawText = function(rawTextString) {
  this.rawText = rawTextString;
};

annotationPDFSchema.methods.setAuthor = function(authorString) {
  this.author = authorString;
};

annotationPDFSchema.methods.setOriginSlide = function(originSlideNumber) {
  this.originSlide = originSlideNumber;
};

var AnnotationsPDF = mongoose.model('annotationsPDF', annotationPDFSchema);

module.exports = AnnotationsPDF;
