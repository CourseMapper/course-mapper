app.directive('pdfViewer',
    function ($compile, $timeout, $rootScope, $location, $routeParams) {
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

                scope.pageToView = 1;
                scope.scale = 1.0;
                scope.totalPage = 1;

                scope.container = element[0].getElementsByClassName('viewerContainer');
                scope.container = scope.container[0];

                scope.calculateSlideNavigationProgress = function (newSlideNumber) {
                    if (scope.totalPage > 0) {
                        var progressBar = element[0].getElementsByClassName('slideNavigationCurrentProgress');
                        progressBar[0].style.width = ((newSlideNumber / scope.totalPage) * 100) + "%";
                    }
                };

                attrs.$observe('source', function (pdfFilePath) {
                    //console.log(pdfFilePath);
                    if (pdfFilePath) {
                        PDFJS.getDocument(pdfFilePath).then(function (pdfDocument) {

                            if (attrs.currentPageNumber) {
                                scope.pageToView = parseInt(attrs.currentPageNumber);
                            }

                            //console.log("Started loading pdf");
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
                                //console.log("PDF LOADED");

                                scope.pdfIsLoaded = true;

                                //$rootScope.$broadcast('onPdfPageChange', [scope.currentPageNumber, scope.totalPage]);

                                /*
                                 todo: move this somewhere else
                                 currentCanvasHeight = parseInt($('#annotationZone').height());
                                 drawAnnZonesWhenPDFAndDBDone();*/

                                return scope.pdfPageView.draw();
                            });
                        });
                    }
                });

            }, /*end link*/

            controller: function ($scope, $compile, $http, $attrs, $location, $routeParams) {
                $scope.currentPageNumber = 1;
                $scope.pdfIsLoaded = false;
                $scope.totalPage = 0;
                $scope.currentTab = "";


                $scope.changePageNumber = function (value) {
                    //console.log("GOT CALLED");
                    if (($scope.currentPageNumber + value) <= $scope.totalPage && ($scope.currentPageNumber + value) >= 1)
                        $scope.currentPageNumber = $scope.currentPageNumber + value;

                    $scope.setHistoryStack( $scope.currentPageNumber );

                    $timeout(function () {
                        $scope.$apply();

                        $scope.changeSlide($scope.currentPageNumber);
                    });

                };

                $scope.changeSlide = function (newSlideNumber) {
                    $rootScope.clearTagNameErrors();
                    $scope.pdfIsLoaded = false;

                    $scope.pageToView = newSlideNumber;

                    $scope.calculateSlideNavigationProgress(newSlideNumber);

                    PDFJS.getDocument($scope.source).then(function (pdfDocument) {
                        pdfDocument.getPage($scope.pageToView).then(function (pdfPage) {
                            $scope.pdfPageView.setPdfPage(pdfPage);
                            $scope.pdfPageView.draw().catch(function(){});

                            //console.log("PDF LOADED");
                            $scope.pdfIsLoaded = true;

                            $rootScope.$broadcast('onPdfPageChange', [newSlideNumber, $scope.totalPage]);

                            /* todo: move this somewhere else
                             drawAnnZonesWhenPDFAndDBDone();
                             */
                        });
                    });
                };

                $scope.setHistoryStack = function (pageNumber) {
                    $location.search('slidePage', pageNumber);
                };

                $scope.changePageNumberBasedOnUrl = function () {
                    var q = $location.search();

                    if (q.slidePage) {
                        var pageNumFromUrl = parseInt(q.slidePage);

                        if ($scope.currentPageNumber != pageNumFromUrl && pageNumFromUrl > 0 && pageNumFromUrl <= $scope.totalPage) {
                            // we are back from somewhere we read it from the url.
                            $scope.currentPageNumber = pageNumFromUrl;
                            $scope.changeSlide($scope.currentPageNumber);
                        }
                    }
                };

                function adjustPdfScale () {
                  //console.log($scope.pdfPageView);
                  if(typeof $scope.pdfPageView != 'undefined'){
                    if($scope.scale == 0)
                      $scope.scale = 1.0;

                    $scope.scale = $scope.scale * $scope.container.clientWidth / $scope.pdfPageView.width;
                    $scope.pdfPageView.update($scope.scale, 0);
                    $scope.pdfPageView.draw().catch(function(){});

                    //console.log("PDF Scale Change");
                    //$rootScope.$broadcast('reloadTags');
                    //console.log($scope.scale);
                  }
                };

                $(window).resize(function (event) {
                  //console.log("Registered resize. Got tab: " + $scope.currentTab +", callerId: "+event.target);
                  //console.log(event)
                  if($scope.currentTab == "pdf" && $.isWindow(event.target)) {
                    //console.log("Got called on resize");
                    adjustPdfScale();
                  }
                });

                $scope.$on('onAfterInitTreeNode', function(node){
                  //console.log("Got called");
                  //if($scope.pdfReady) {
                    //console.log(node);
                    $rootScope.pdfId = node.targetScope.pdfFile._id;
                  //}
                });

                $scope.$on('onNodeTabChange', function(event, tab){
                  //console.log("Registered tab change. Got tab: " + tab);
                  $scope.currentTab = tab;
                  if(tab == "pdf") {
                    adjustPdfScale();
                  }
                });

                $scope.$on('onPdfPageChange', function (event, params) {
                    setCurrentCanvasHeight(parseInt($('#annotationZone').height()));
                });

                // onload
                $scope.$watch('totalPage', function(newVal, oldVal){
                    if(oldVal !== newVal){
                        $scope.changePageNumberBasedOnUrl();
                    }
                });

                $scope.$on('$routeUpdate', function(next, current){
                    if(!$location.search().slidePage) {
                        $scope.setHistoryStack($scope.currentPageNumber);
                    } else {
                        var sp = parseInt($location.search().slidePage);
                        if(sp > 0 && sp != $scope.currentPageNumber && sp <= $scope.totalPage){
                            $scope.changePageNumberBasedOnUrl();
                        }
                    }
                });
            }
        };
    });
