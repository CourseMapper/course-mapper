var mongoose = require('mongoose');


var annotationZonesPDFSchema = new mongoose.Schema({
    annotationZoneName: {
      type: String,
      required: true
    },
    relativeCoordinates: {
      type: Number,
    //  required: true
    },
    relativeDimensions: {
      type: Number,
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
