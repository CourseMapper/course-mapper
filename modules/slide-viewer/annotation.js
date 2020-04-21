var mongoose = require('mongoose');

var annotationPDFSchema = new mongoose.Schema({
  parentId: { type: String },
  hasParent: { type: Boolean },
  //createdMarkups: {},
  rawText: { type: String, required: true },
  renderedText: { type: String, required: false },
  author: { type: String, required: true },
  authorID: { type: String },
  authorDisplayName: { type: String },
  dateOfCreation: { type: Date },
  //isDeleted: {},
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'resources'
  },
  pdfPageNumber: { type: Number },
  isPrivate: { type: Boolean }
}, {
  usePushEach: true
});

// Define indexes
// annotationPDFSchema.index(
//   { renderedText: 'text' }, {
//     renderedText: 'best_match_name',
//     weights: { renderedText: 1 }
//   });
annotationPDFSchema.index({ renderedText: 'text' });

annotationPDFSchema.pre('save', function (next) {
  this.dateOfCreation = new Date();
  next();
});

var AnnotationsPDF = mongoose.model('annotationPDF', annotationPDFSchema);

AnnotationsPDF.ensureIndexes();
// AnnotationsPDF.on('index', function(err){
//   console.log("AnnotationsPDF: " + err);
// });

module.exports = AnnotationsPDF;