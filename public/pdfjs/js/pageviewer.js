/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

if (!PDFJS.PDFViewer || !PDFJS.getDocument) {
  alert('Please build the library and components using\n' +
        '  `node make generic components`');
}

// In cases when the pdf.worker.js is located at the different folder than the
// pdf.js's one, or the pdf.js is executed via eval(), the workerSrc property
// shall be specified.
//
// PDFJS.workerSrc = 'pdfjs/build/pdf.worker.js';

// Some PDFs need external cmaps.
//
// PDFJS.cMapUrl = '../../external/bcmaps/';
// PDFJS.cMapPacked = true;

var DEFAULT_URL = '/slide-viewer/ressources/00_Orga.pdf';
var PAGE_TO_VIEW = 1;
var SCALE = 1.0;

var pdfPageView;


// Loading document.
$(document).ready(function(){
  PDFJS.getDocument(DEFAULT_URL).then(function (pdfDocument) {
    var container;
    console.log("Started loading pdf");
    container =  document.getElementById('viewerContainer');
    angular.element(document.querySelector('[ng-controller="PDFNavigationController"]')).scope().maxPageNumber = pdfDocument.numPages;
    // Document loaded, retrieving the page.
    return pdfDocument.getPage(PAGE_TO_VIEW).then(function (pdfPage) {
      // Creating the page view with default parameters.
      pdfPageView = new PDFJS.PDFPageView({
        container: container,
        id: PAGE_TO_VIEW,
        scale: SCALE,
        defaultViewport: pdfPage.getViewport(SCALE),
        // We can enable text/annotations layers, if needed
        textLayerFactory: new PDFJS.DefaultTextLayerFactory(),
        annotationsLayerFactory: new PDFJS.DefaultAnnotationsLayerFactory()
      });
      // Associates the actual page with the view, and drawing it
      pdfPageView.setPdfPage(pdfPage);
      SCALE = SCALE * $("#viewerContainer").width() / pdfPageView.width;
      pdfPageView.update(SCALE,0);
      currentCanvasHeight=parseInt($('#annotationZone').height());
      console.log("PDF LOADED");
      pdfIsLoaded = true;
      drawAnnZonesWhenPDFAndDBDone();
      return pdfPageView.draw();
    });
  });
});


function changeSlide(newSlideNumber){

  PAGE_TO_VIEW = newSlideNumber;

  /*HIER MUSS DIE 36 MIT DER MAX NUMBER ERSETZT WERDEN.*/
  $("#slideNavigationCurrentProgress").width(((newSlideNumber/36)*100)+"%");


  PDFJS.getDocument(DEFAULT_URL).then(function (pdfDocument) {
    pdfDocument.getPage(PAGE_TO_VIEW).then(function (pdfPage) {
      pdfPageView.setPdfPage(pdfPage);
      pdfPageView.draw();
      console.log("PDF LOADED");
      pdfIsLoaded = true;
      drawAnnZonesWhenPDFAndDBDone();

    });
  });
}

$( window ).resize(function() {
  SCALE = SCALE * $("#viewerContainer").width() / pdfPageView.width;
  pdfPageView.update(SCALE,0);
  pdfPageView.draw();
});
