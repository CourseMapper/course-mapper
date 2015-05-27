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
        if(data.categories)
            $scope.categories = data.categories;
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
        instance.draggable(mapEl);

        instance.bind("click", function (c) {
            instance.detach(c);
        });

        // initialise all '.w' elements as connection targets.
        instance.batch(function () {
            /*instance.makeSource(mapEl, {
                filter: ".ep",
                anchor: "Continuous",
                connector: [ "StateMachine", { curviness: 20 } ],
                connectorStyle: { strokeStyle: "#5c96bc", lineWidth: 2, outlineColor: "transparent", outlineWidth: 4 },
                maxConnections: 5,
                onMaxConnections: function (info, e) {
                    alert("Maximum connections (" + info.maxConnections + ") reached");
                }
            });*/

            /*instance.makeTarget(mapEl, {
                dropOptions: {hoverClass: "dragHover"},
                anchor: "Continuous",
                allowLoopback: true
            });*/

            /* connect center to first level cats*/
            for(var i in $scope.categories){
                var cat = $scope.categories[i];
                instance.connect({
                    source: 'center', target: cat.slug,
                    anchors: [
                        [ "Perimeter", { shape: jsPlumb.getSelector('#center')[0].getAttribute("data-shape") }],
                        [ "Perimeter", { shape: jsPlumb.getSelector('#'+cat.slug)[0].getAttribute("data-shape") }]
                    ]
                });
                $scope.interConnect(cat, instance);
            }
        });
    };

    $scope.interConnect = function(category, instance){
        if(category.subCategories){
            for(var i in category.subCategories){
                var child = category.subCategories[i];
                instance.connect({
                    source: category.slug, target: child.slug,
                    anchors: [
                        [ "Perimeter", { shape: jsPlumb.getSelector('#'+category.slug)[0].getAttribute("data-shape") }],
                        [ "Perimeter", { shape: jsPlumb.getSelector('#'+child.slug)[0].getAttribute("data-shape") }]
                    ]
                });

                $scope.interConnect(child, instance);
            }
        }
    }

});