app.directive('pdfViewer',
    function () {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                source: '@',
                pageNumber: '@',
                showControl: '='
            },

            templateUrl: '/angular/views/pdf-viewer.html',

            link: function (scope, element, attrs) {
                if (!PDFJS.PDFViewer || !PDFJS.getDocument) {
                    alert('Please build the library and components using\n' +
                    '  `node make generic components`');
                }

                //var DEFAULT_URL = '/slide-viewer/ressources/00_Orga.pdf';
                scope.pageToView = 1;
                scope.scale = 1.0;
                scope.totalPage = 0;

                scope.container = element[0].getElementsByClassName('viewerContainer');
                scope.container = scope.container[0];

                attrs.$observe('source', function(pdfFilePath){
                    console.log(pdfFilePath);
                    if(pdfFilePath){
                        PDFJS.getDocument(pdfFilePath).then(function (pdfDocument) {

                            console.log("Started loading pdf");
                            scope.totalPage = pdfDocument.numPages;

                            // Document loaded, retrieving the page.
                            return pdfDocument.getPage(scope.pageToView).then(function (pdfPage) {
                                // Creating the page view with default parameters.
                                pdfPageView = new PDFJS.PDFPageView({
                                    container: scope.container,
                                    id: scope.pageToView,
                                    scale: scope.scale,
                                    defaultViewport: pdfPage.getViewport(scope.scale),

                                    // We can enable text/annotations layers, if needed
                                    textLayerFactory: new PDFJS.DefaultTextLayerFactory(),
                                    annotationsLayerFactory: new PDFJS.DefaultAnnotationsLayerFactory()
                                });

                                // Associates the actual page with the view, and drawing it
                                pdfPageView.setPdfPage(pdfPage);
                                scope.scale = scope.scale * scope.container.clientWidth / pdfPageView.width;

                                pdfPageView.update(scope.scale, 0);
                                console.log("PDF LOADED");

                                /*
                                 todo: move this somewhere else
                                 scope.pdfIsLoaded = true;
                                 currentCanvasHeight = parseInt($('#annotationZone').height());
                                 drawAnnZonesWhenPDFAndDBDone();*/

                                return pdfPageView.draw();
                            });
                        });
                    }
                });


            }
        };
    });