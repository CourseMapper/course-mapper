app.directive('pdfViewer',
    function ($compile, $timeout, $rootScope) {
        return {
            restrict: 'E',

            terminal: true,

            scope: {
                source: '@',
                currentPageNumber: '=',
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
                scope.totalPage = 1;

                scope.container = element[0].getElementsByClassName('viewerContainer');
                scope.container = scope.container[0];

                attrs.$observe('source', function (pdfFilePath) {
                    console.log(pdfFilePath);
                    if (pdfFilePath) {
                        PDFJS.getDocument(pdfFilePath).then(function (pdfDocument) {

                            console.log("Started loading pdf");
                            scope.totalPage = pdfDocument.numPages;

                            scope.calculateSlideNavigationProgress(scope.currentPageNumber);

                            // this will apply totalpage to the html
                            $timeout(function () {
                                scope.$apply();
                            });

                            // Document loaded, retrieving the page.
                            return pdfDocument.getPage(scope.pageToView).then(function (pdfPage) {
                                // Creating the page view with default parameters.
                                scope.pdfPageView = new PDFJS.PDFPageView({
                                    container: scope.container,
                                    id: scope.pageToView,
                                    scale: scope.scale,
                                    defaultViewport: pdfPage.getViewport(scope.scale),

                                    // We can enable text/annotations layers, if needed
                                    textLayerFactory: new PDFJS.DefaultTextLayerFactory(),
                                    annotationsLayerFactory: new PDFJS.DefaultAnnotationsLayerFactory()
                                });

                                // Associates the actual page with the view, and drawing it
                                scope.pdfPageView.setPdfPage(pdfPage);
                                scope.scale = scope.scale * scope.container.clientWidth / scope.pdfPageView.width;

                                scope.pdfPageView.update(scope.scale, 0);
                                console.log("PDF LOADED");

                                scope.pdfIsLoaded = true;
                                $rootScope.$broadcast('onPdfPageChange', scope.currentPageNumber);
                                /*
                                 todo: move this somewhere else
                                 currentCanvasHeight = parseInt($('#annotationZone').height());
                                 drawAnnZonesWhenPDFAndDBDone();*/

                                return scope.pdfPageView.draw();
                            });
                        });
                    }
                });

                scope.calculateSlideNavigationProgress = function(newSlideNumber){
                    if(scope.totalPage > 0) {
                        var progressBar = element[0].getElementsByClassName('slideNavigationCurrentProgress');
                        progressBar[0].style.width = ((newSlideNumber / scope.totalPage) * 100) + "%";
                    }
                };

            }, /*end link*/

            controller: function ($scope, $compile, $http, $attrs) {
                $scope.currentPageNumber = 1;
                $scope.pdfIsLoaded = false;
                $scope.totalPage = 0;

                $scope.changePageNumber = function (value) {
                    //console.log("GOT CALLED");
                    if (($scope.currentPageNumber + value) <= $scope.totalPage && ($scope.currentPageNumber + value) >= 1)
                        $scope.currentPageNumber = $scope.currentPageNumber + value;

                    $timeout(function () {
                        $scope.$apply();
                        $scope.pdfIsLoaded = false;

                        $scope.changeSlide($scope.currentPageNumber);
                    });

                };

                $scope.changeSlide = function (newSlideNumber) {
                    $scope.pageToView = newSlideNumber;

                    $scope.calculateSlideNavigationProgress(newSlideNumber);

                    PDFJS.getDocument($scope.source).then(function (pdfDocument) {
                        pdfDocument.getPage($scope.pageToView).then(function (pdfPage) {
                            $scope.pdfPageView.setPdfPage(pdfPage);
                            $scope.pdfPageView.draw();

                            console.log("PDF LOADED");
                            $scope.pdfIsLoaded = true;

                            $rootScope.$broadcast('onPdfPageChange', newSlideNumber);

                            /* todo: move this somewhere else
                            drawAnnZonesWhenPDFAndDBDone();
                             */
                        });
                    });
                };

                $( window ).resize(function() {
                    $scope.scale = $scope.scale * $scope.container.clientWidth / $scope.pdfPageView.width;
                    $scope.pdfPageView.update($scope.scale,0);
                    $scope.pdfPageView.draw();
                });
            }
        };
    });