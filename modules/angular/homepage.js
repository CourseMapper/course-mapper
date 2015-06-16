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
        $scope.center = {x:$scope.width/2, y: ($scope.height/2)-100};
    });

    /**
     * get all categories, recursived on the server
     */
    $http.get('/api/categories').success(function (data) {
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
        console.log(ngRepeatFinishedEvent);
        $scope.initJSPlumb();
    });

    $scope.initJSPlumb = function(){
        Tree.init(Canvas.w, Canvas.h);

        var instance = jsPlumb.getInstance({
            Endpoint: ["Blank", {radius: 2}],
            HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            PaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            ConnectionOverlays: [ ],
            Container: "category-map"
        });

        // so the ejs can access this instance
        $rootScope.initDraggable(instance);

        // initialise all '.w' elements as connection targets.
        instance.batch(function () {
            /* connect center to first level cats recursively*/
            $scope.interConnect('center', $scope.categories, instance);
        });
    };

    $scope.interConnect = function(parent, categories, instance){
        for(var i in categories){
            var child = categories[i];

            // instantiate on hover
            $('#' + child.slug).mouseover(function(){
                $(this).find('ul').show();
            }).mouseout(function(){$(this).find('ul').hide()});

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
    };

    $scope.goToDetail = function(categorySlug){
        window.location.href = "/courses/#/category/" + categorySlug;
    };

});
