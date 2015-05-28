app.controller('HomePageController', function($scope, $http, $rootScope) {
    $scope.hideSlider = false;

    $(document).ready(function(){
        if(typeof(localStorage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            if(localStorage.hideSlider){
                $scope.hideSlider = localStorage.hideSlider;
            }
        }

        $scope.width = jQuery(window).width();
        $scope.height = jQuery(window).height();
        $scope.center = {x:$scope.width/2, y: $scope.height/2};

    });

    /**
     * get all categories, recursived on the server
     */
    $http.get('/api/catalogs/categories').success(function (data) {
        if(data.categories) {
            $scope.categories = data.categories; 
        }
        else
            $scope.categories = false;
    });

    $scope.setHideSlider = function(){
        $scope.hideSlider = true;
        if(typeof(localStorage) !== "undefined")
            localStorage.hideSlider = true;
    };

    $scope.$watch('hideSlider', function(){
        if($scope.hideSlider){
            //$scope.initJSPlumb();
        }
    });

    $scope.$on('jsTreeInit', function (ngRepeatFinishedEvent) {
        console.log((ngRepeatFinishedEvent));
        $scope.initJSPlumb();
    });

    $scope.initJSPlumb = function(){
        var instance = jsPlumb.getInstance({
            Endpoint: ["Dot", {radius: 2}],
            HoverPaintStyle: {strokeStyle: "#1e8151", lineWidth: 2 },
            ConnectionOverlays: [ ],
            Container: "category-map"
        });

        // let us drag and drop the cats
        var mapEl = jsPlumb.getSelector(".category-map .w");
        instance.draggable(mapEl,{
            // update position on drag stop
            stop: function() {
                var el = $(this);
                var pos = el.offset();
                var distanceFromCenter = {
                    x: pos.left - $scope.center.x,
                    y: pos.top - $scope.center.y
                };

                $http.put('/api/catalogs/category/' + el.attr('id') + '/fromCenter', distanceFromCenter)
                    .success(function(res, status){
                        console.log(res);
                    })
                    .error(function(res, status){
                        console.log('err');
                        console.log(res);
                    });

                console.log(distanceFromCenter);
            }
        });

        /*instance.bind("click", function (c) {
            instance.detach(c);
        });*/

        // initialise all '.w' elements as connection targets.
        instance.batch(function () {
            /* connect center to first level cats recursively*/
            $scope.interConnect('center', $scope.categories, instance);
        });
    };

    $scope.interConnect = function(parent, categories, instance){
        for(var i in categories){
            var child = categories[i];
            instance.connect({
                source: parent, target: child.slug,
                anchors: [
                    [ "Perimeter", { shape: jsPlumb.getSelector('#'+parent)[0].getAttribute("data-shape") }],
                    [ "Perimeter", { shape: jsPlumb.getSelector('#'+child.slug)[0].getAttribute("data-shape") }]
                ]
            });

            if(child.subCategories) {
                $scope.interConnect(child.slug, child.subCategories, instance);
            }
        }

    }

});