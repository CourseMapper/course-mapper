var mongoose = require('mongoose');


var annotationPDFSchema = new mongoose.Schema({
    parentId: {
        type: String
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
    authorID: {
        type: String
    },
    dateOfCreation: {
      type: Date
    },
    //isDeleted: {},
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
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
