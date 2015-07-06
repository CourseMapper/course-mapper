var mongoose = require('mongoose');


var annotationZonesPDFSchema = new mongoose.Schema({
    annotationZoneName: {
      type: String,
      required: true
    }
    //relativeCoordinates: {},
    //relativeDimensions: {},
    //color: {},
    //annotationId: {}
});


var AnnotationZonesPDF = mongoose.model('annotationZonesPDF', annotationZonesPDFSchema);

module.exports = AnnotationZonesPDF;
