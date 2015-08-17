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
      type: String,
    //  required: true
    }
    //annotationId: {}
});


var AnnotationZonesPDF = mongoose.model('annotationZonesPDF', annotationZonesPDFSchema);

module.exports = AnnotationZonesPDF;
