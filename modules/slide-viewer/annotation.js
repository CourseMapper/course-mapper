var mongoose = require('mongoose');


var annotationPDFSchema = new mongoose.Schema({
    parentId: {
        type: Number
    },
    hasParent: {
        type: Boolean
    },
    //createdMarkups: {},
    rawText: {
        type: String,
        required: true
    },
    renderedText: {
        type: String,
        required: false
    },
    author: {
        type: String,
        required: true,
    },
    dateOfCreation: {
      type: Date
    },
    //votes: {},
    //isDeleted: {},
    pdfId: {
      type: Number
    },
    pdfPageNumber: {
      type: Number
    }
});

annotationPDFSchema.pre('save', function(next){
    this.dateOfCreation = new Date();
    next();
});

var AnnotationsPDF = mongoose.model('annotationPDF', annotationPDFSchema);

module.exports = AnnotationsPDF;
