app.controller('HomePageController', function ($scope, $http, $rootScope, $sce, Page) {
    $scope.hideSlider = false;
    $scope.isRequesting = false;
    $scope.widgets = [];
    Page.setTitleWithPrefix('Home');

    $(document).ready(function () {
        if (typeof(localStorage) !== "undefined") {
            // Code for localStorage/sessionStorage.
            if (localStorage.hideSlider) {
                $scope.hideSlider = localStorage.hideSlider;
            }
        }

        $scope.width = jQuery(window).width();
        $scope.height = jQuery(window).height();
        $scope.center = {x: $scope.width / 2, y: ($scope.height / 2) - 100};
    });

    /**
     * get all categories, recursived on the server
     */
    $http.get('/api/categories').success(function (data) {
        if (data.categories) {
            $scope.categories = data.categories;
        }
        else
            $scope.categories = false;
    });

    $scope.setHideSlider = function () {
        $scope.hideSlider = true;
        if (typeof(localStorage) !== "undefined")
            localStorage.hideSlider = true;
    };

    $scope.$watch('hideSlider', function () {
        if ($scope.hideSlider) {
            //$scope.initJSPlumb();
        }
    });

    $scope.$on('jsTreeInit', function (ngRepeatFinishedEvent) {
        $scope.initJSPlumb();
    });

    $scope.initJSPlumb = function () {
        Tree.init(Canvas.w, Canvas.h);

        var instance = jsPlumb.getInstance({
            Endpoint: ["Blank", {radius: 2}],
            HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2},
            PaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2},
            ConnectionOverlays: [],
            Container: "category-map"
        });

        // so the ejs can access this instance
        $rootScope.initDraggable(instance);

        // initialise all '.w' elements as connection targets.
        instance.batch(function () {
            /* connect center to first level cats recursively*/
            $scope.interConnect('center', $scope.categories, instance);

            /*blanket on click to close dropdown menu*/
            $scope.initDropDownMenuHybrid();
        });
    };

    $scope.initDropDownMenuHybrid = function () {
        $(document).on('click', function (event) {
            var target = $(event.target);
            var k = target.parents('div');
            if (k.hasClass('ui-draggable')) {
                return false;
            }

            if ($('.open').length > 0) {
                $('.open').removeClass('open');
                return false;
            }
        });
    };

    $scope.initDropDown = function (slug) {
        $('#' + slug)
            .on('click mousedown mouseup touchstart', function (event) {
                if ($(this).find('ul').hasClass('open')) {
                    if ($(this).find('li').hasClass('goto-button')) {
                        return true;
                    }

                    $('.open').removeClass('open');
                    return false;
                }

                $('.open').not($(this).parents('ul')).removeClass('open');
                $(this).find('ul').addClass('open');

                return false;
            })
            .on('mouseenter', function () {
                $http.get('/api/server-widgets/category-homepage/?slug=' + slug).success(
                    function (res) {
                        if (res.result) {
                            $scope.widgets[slug] = $sce.trustAsHtml(res.widgets);
                        }
                    }
                );
            });
    };

    $scope.interConnect = function (parent, categories, instance) {
        for (var i in categories) {
            var child = categories[i];

            $scope.initDropDown(child.slug);

            instance.connect({
                source: parent, target: child.slug,
                anchors: [
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + parent)[0].getAttribute("data-shape")}],
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + child.slug)[0].getAttribute("data-shape")}]
                ],
                connector: ["Bezier", {curviness: 5}]
            });

            if (child.subCategories) {
                $scope.interConnect(child.slug, child.subCategories, instance);
            }
        }
    };

    $scope.goToDetail = function (categorySlug) {
        window.location.href = "/courses/#/category/" + categorySlug;
    };

});
