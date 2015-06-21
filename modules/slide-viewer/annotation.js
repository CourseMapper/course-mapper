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

var AnnotationsPDF = mongoose.model('annotationPDF', annotationPDFSchema);

module.exports = AnnotationsPDF;
