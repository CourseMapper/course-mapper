app.controller('HomePageController', function ($scope, $http, $rootScope,
                                               $sce, Page, collapseService, $timeout) {
    $scope.hideSlider = false;
    $scope.isRequesting = false;
    $scope.widgets = [];
    Page.setTitleWithPrefix('Home');

    $scope.collapseStatus = {};
    $scope.nodeChildrens = {};
    $scope.firstloaded = true;

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

        $timeout(function () {
            $scope.firstCollapse($scope.categories);
            $scope.getCollapseDataFromLStorage();

            $scope.initiateCollapse();
            jQuery('.tree-container').css('visibility', 'visible');
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

                if (event.type == 'touchstart') {
                    $http.get('/api/server-widgets/category-homepage/?slug=' + slug).success(
                        function (res) {
                            if (res.result) {
                                $scope.widgets[slug] = $sce.trustAsHtml(res.widgets);
                            }
                        }
                    );
                }

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

            var conn = instance.connect({
                source: parent, target: child.slug,
                anchors: [
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + parent)[0].getAttribute("data-shape")}],
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + child.slug)[0].getAttribute("data-shape")}]
                ],
                connector: ["Bezier", {curviness: 5}]
            });

            $(conn.connector.canvas).attr('data-source', parent);
            $(conn.connector.canvas).attr('data-target', child.slug);

            if (child.subCategories) {
                $scope.interConnect(child.slug, child.subCategories, instance);
            }
        }

    };

    $scope.goToDetail = function (categorySlug) {
        window.location.href = "/courses/#/category/" + categorySlug;
    };

    $scope.firstCollapse = function (categories) {
        if (!$scope.firstloaded)
            return;

        $scope.firstloaded = false;
        for (var i = 0; i < categories.length; i++) {
            var child = categories[i];

            $scope.getChildLength(child._id, 0, child);
        }

        // collapse on first level
        for (var j in $scope.nodeChildrens[1]) {
            var totalKids = $scope.nodeChildrens[1][j];
            if (totalKids > 0) {
                collapseService.setCollapseFirst(j);
                $scope.collapseStatus[j] = true;
            } else {
                collapseService.setExpandFirst(j);
                $scope.collapseStatus[j] = false;
            }
        }
    };

    $scope.initiateCollapse = function () {
        for (var i in collapseService.collapsed) {
            var colEl = 't' + collapseService.collapsed[i];
            $scope.collapse(colEl, true);
        }
    };

    $scope.getCollapseDataFromLStorage = function () {
        if (typeof(localStorage) == "undefined")
            return;

        for (var i in localStorage) {
            var collData = localStorage[i];
            if (i.indexOf("collapse") > -1) {
                var _id = i.split('.');
                _id = _id[1];
                collData = parseInt(collData);
                if (collData) {
                    collapseService.setCollapse(_id);
                    $scope.collapseStatus[_id] = true;
                }
                else {
                    collapseService.setExpand(_id);
                    $scope.collapseStatus[_id] = false;
                }
            }
        }
    };

    $scope.getChildLength = function (nid, level, categories) {

        if ($scope.nodeChildrens[level] == undefined) {
            $scope.nodeChildrens[level] = {};
        }

        if ($scope.nodeChildrens[level][nid] == undefined) {
            $scope.nodeChildrens[level][nid] = 0;
        }

        var add = 0;
        if (categories.subCategories && categories.subCategories.length > 0)
            add = 1;

        $scope.nodeChildrens[level][nid] += add;

        if (level > 1) {
            if ($scope.nodeChildrens[level][nid] > 0) {
                collapseService.setCollapseFirst(nid);
                $scope.collapseStatus[nid] = true;
            }
        }

        if (categories.subCategories && categories.subCategories.length > 0) {
            level++;
            for (var e in categories.subCategories) {
                var ch = categories.subCategories[e];
                $scope.getChildLength(ch._id, level, ch);
            }
        }
    };

    var found = false;
    $scope.findNode = function (obj, col, searchKey, searchValue) {
        if (found)
            return found;

        for (var i in obj) {
            var tn = obj[i];

            if (tn[searchKey] && tn[searchKey] == searchValue) {
                found = tn;
                return tn;
            }
            else if (tn[col] && tn[col].length > 0) {
                // search again
                $scope.findNode(tn[col], col, searchKey, searchValue);
            }
        }

        if (found)
            return found;
    };

    $scope.collapse = function (el, isInit) {
        var nodeId = el.substring(1);

        found = false;
        var pNode = $scope.findNode($scope.categories, 'subCategories', '_id', nodeId);
        if (pNode) {
            var hide = false;

            if (isInit === true)
                hide = collapseService.isCollapsed(nodeId);
            else
                hide = collapseService.toggle(nodeId);

            if (hide === false) {
                $scope.collapseStatus[nodeId] = false;
                $('#' + el).addClass('aborted');
                collapseService.affectVisualCat(false, pNode, pNode.slug);
            }
            else if (hide >= 0 || hide == true) {
                $scope.collapseStatus[nodeId] = true;
                collapseService.affectVisualCat(true, pNode, pNode.slug);
                $('#' + el).removeClass('aborted');
            }

        }
    };
});
