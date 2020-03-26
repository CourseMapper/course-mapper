var mongoose = require('mongoose');


var annotationZonesPDFSchema = new mongoose.Schema({
    annotationZoneName: {
      type: String,
      required: true
    },
    relativeCoordinates: {
      X: {
        type: Number
      },
      Y: {
        type: Number
      }

    //  required: true
    },
    relativeDimensions: {
      X: {
        type: Number
      },
      Y: {
        type: Number
      }
    //  required: true
    },
    color: {
      type: String
    },
    author: {
        type: String
    },
    authorID: {
        type: String
    },
    pdfId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    pdfPageNumber: {
      type: Number,
      required: true
    }
}, {
    usePushEach: true
});

var AnnotationZonesPDF = mongoose.model('annotationZonesPDF', annotationZonesPDFSchema);

module.exports = AnnotationZonesPDF;
