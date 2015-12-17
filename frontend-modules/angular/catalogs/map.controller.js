app.controller('MapController', function ($scope, $http, $rootScope, authService,
                                          $timeout, $sce, $location, socket,
                                          toastr, mapService, courseService,
                                          collapseService) {

    $scope.treeNodes = [];
    $scope.jsPlumbConnections = [];
    $scope.widgets = [];
    $scope.isTreeInitiated = false;
    $scope.isCurrentTabIsMap = false;
    $scope.infoToast = null;
    $scope.infoEmptyToast = null;
    $scope.instance = null;
    $scope.nodeModaltitle = "";
    $scope.currentNodeAction = {};
    $scope.collapseStatus = {};

    /**
     * find node recursively
     *
     * @param obj
     * @param col next search will be the array value of this key
     * @param searchKey
     * @param searchValue
     * @returns {*}
     */
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

    $scope.initDropDownMenuHybrid = function () {
        $('#tree .course-map').on('click', function (event) {
            var target = $(event.target);
            var k = target.parents('div');
            if (k.hasClass('ui-draggable') && k.hasClass('w')) {
                return true;
            } else if (k.hasClass('center-course')) {
                return true;
            } else if (target.hasClass('w')) {
                return true;
            }

            if ($('.open').length > 0) {
                $('.open').removeClass('open');
                return false;
            }
        });
    };

    /**
     * get all categories, recursived on the server
     */
    $scope.initTab = function (course) {
        // add hover to center instantiate on hover
        $scope.initDropDown('center');

        mapService.init(course._id,

            function (treeNodes) {
                if (treeNodes.length > 0) {
                    $scope.treeNodes = treeNodes;
                } else {
                    $scope.initJSPlumb();
                    $scope.showMapEmptyInfo();
                }

                socket.subscribe('map/' + course._id);
            },

            function (err) {
                console.log(err);
                toastr.error('cannot load course tree');
            }
        );
    };

    $scope.tabOpened = function () {

        if (courseService.course) {
            $scope.course = courseService.course;

            if (mapService.treeNodes) {
                $scope.treeNodes = mapService.treeNodes;
            }

            $scope.initTab(courseService.course);
        } else {

            $scope.$on('onAfterInitCourse', function (event, course) {
                $scope.initTab(course);
            });
        }

        $rootScope.$broadcast('onCoursePreviewTabOpened', $scope.currentTab);
    };

    // initiate draggable jqUI to the topic node
    $scope.initDraggable = function (jsPlumbInstance) {
        var w = window.innerWidth;
        var h = window.innerHeight;

        // let us drag and drop the cats
        var mapEl = jsPlumb.getSelector(".course-map .w");
        jsPlumbInstance.draggable(mapEl, {
            start: function (params) {
                var el = $(params.el);
                var nId = el.attr('id').substring(1);
                var simulated = el.attr('is-simulated');
                if (simulated && simulated == 'simulated') {
                    return;
                }

                var owned = el.hasClass('owned');
                if (!owned) {
                    params.drag.abort();
                }

                if (collapseService.isCollapsed(nId) !== false) {
                    params.drag.abort();
                }
            },

            // update position on drag stop
            stop: function (params) {
                var el = $(params.el);
                var pos = el.position();
                var distanceFromCenter = {
                    x: pos.left - Canvas.w / 2,
                    y: pos.top - Canvas.h / 2
                };

                var simulated = el.attr('is-simulated');
                if (simulated && simulated == 'simulated') {
                    el.attr('is-simulated', '');
                    return;
                }

                var nId = el.attr('id').substring(1); // remove 't' from the node id
                found = false;
                var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', nId);

                $http.put('/api/treeNodes/' + nId + '/positionFromRoot', distanceFromCenter)
                    .success(function (res, status) {
                        //console.log(res);
                        if (pNode)
                            pNode.positionFromRoot = distanceFromCenter;
                    })
                    .error(function (res, status) {
                        console.log('err');
                        console.log(res);
                    });
            }
        });
    };

    $scope.initJSPlumb = function () {
        Tree.init(Canvas.w, Canvas.h);
        jsPlumb.ready(function () {
            $scope.instance = jsPlumb.getInstance({
                Endpoint: ["Blank", {radius: 2}],
                HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2},
                PaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2},
                ConnectionOverlays: [],
                Container: "course-map"
            });

            $scope.initDraggable($scope.instance);

            // initialise all '.w' elements as connection targets.
            $scope.instance.batch(function () {
                /* connect center to first level cats recursively*/
                $scope.interConnect('center', $scope.treeNodes, $scope.instance);

                /*blanket on click to close dropdown menu*/
                $scope.initDropDownMenuHybrid();
            });
        });
    };

    $scope.initDropDown = function (slug) {
        $('#' + slug)
            .on('click mousedown mouseup touchstart', function (event) {
                if ($(this).find('ul').hasClass('open')) {
                    if ($(this).find('ul').hasClass('dropdown-course')) {
                        return true;
                    }

                    $('.open').removeClass('open');
                    return false;
                }

                var simulated = $(this).attr('is-simulated');
                if (simulated && simulated == 'simulated') {
                    return true;
                }

                $('.open').not($(this).parents('ul')).removeClass('open');
                $(this).find('ul').addClass('open');

                return false;
            })
            .on('mouseenter', function () {
                if ($(this).hasClass('subTopic')) {
                    return true;
                }
                if ($(this).hasClass('deleted')) {
                    return true;
                }
                $scope.requestIconAnalyitics(slug);
            });
    };

    $scope.showMapInfo = function () {
        if (!$scope.infoToast) {
            $scope.infoToast = toastr.info(
                'To add a pdf or a video node (which we call "Content Node"), ' +
                '<br>you need to have at least a subtopic node that acts as a hub.' +
                '<br>' +
                '<br>Hover over the node to see available actions, such as create subtopic or content node'
                , {
                    allowHtml: true,
                    autoDismiss: false,
                    onHidden: function () {
                        if ($scope.infoToast)$scope.infoToast = null;
                    },
                    tapToDismiss: true,
                    extendedTimeOut: 10000,
                    timeOut: 10000,
                    toastClass: 'toast wide',
                });
        } else {
            toastr.clear();
            $scope.infoToast = null;
        }
    };

    $scope.showMapEmptyInfo = function () {
        if (!$scope.infoEmptyToast) {
            $scope.infoEmptyToast = toastr.info(
                'Hi, this course is new, Please add a subtopic first, ' +
                '<br>from there, you can add a content node, then upload a pdf or a video.' +
                '<br>' +
                '<br>Hover over the center node to see available actions.'
                , {
                    allowHtml: true,
                    autoDismiss: false,
                    onHidden: function () {
                        if ($scope.infoEmptyToast)$scope.infoEmptyToast = null;
                    },
                    tapToDismiss: true,
                    extendedTimeOut: 10000,
                    timeOut: 10000,
                    toastClass: 'toast wide',
                });
        } else {
            toastr.clear();
            $scope.infoEmptyToast = null;
        }
    };

    $scope.interConnect = function (parent, treeNodes, instance) {
        // added "t" in id because id cannot start with number
        for (var i = 0; i < treeNodes.length; i++) {
            var child = treeNodes[i];
            var childId = 't' + child._id;

            if (child.isDeletedForever)
                continue;

            // instantiate on hover
            $scope.initDropDown(childId);

            // connecting parent and chidlern
            var conn = instance.connect({
                source: parent, target: childId,
                anchors: [
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + parent)[0].getAttribute("data-shape")}],
                    ["Perimeter", {shape: jsPlumb.getSelector('#' + childId)[0].getAttribute("data-shape")}]
                ],
                deleteEndpointsOnDetach: true,
                connector: ["Bezier", {curviness: 5}]
            });

            $(conn.connector.canvas).attr('data-source', parent);
            $(conn.connector.canvas).attr('data-target', childId);

            var cc = {
                source: parent,
                target: childId,
                conn: conn
            };

            $scope.jsPlumbConnections.push(cc);

            if (child.childrens) {
                $('#' + parent + ' .collapse-button').addClass('hasChildren');
                $scope.interConnect(childId, child.childrens, instance);
            }
        }
    };

    $scope.setMode = function (mode, type, parent) {
        switch (mode) {
            case 'add':
                $scope.currentNodeAction.mode = "add";
                break;
            case 'edit':
                $scope.currentNodeAction.mode = "edit";
                break;
        }

        switch (type) {
            case 'subTopic':
                $scope.currentNodeAction.type = "subTopic";
                $scope.currentNodeAction.typeText = "Sub Topic";
                break;

            case 'contentNode':
                $scope.currentNodeAction.type = "contentNode";
                $scope.currentNodeAction.typeText = "Content Node";
                break;
        }

        $scope.nodeModaltitle = $scope.currentNodeAction.mode + " " + $scope.currentNodeAction.typeText;

        if (parent) {
            $scope.currentNodeAction.parent = parent;
            if (mode == 'add')
                $scope.nodeModaltitle += " under " + parent.name;
        }
        else
            $scope.currentNodeAction.parent = false;

        $rootScope.$broadcast('onAfterSetMode', $scope.course);
    };

    $scope.parseResources = function () {
        for (var i = 0; i < $scope.currentNodeAction.parent.resources.length; i++) {
            var content = $scope.currentNodeAction.parent.resources[i];
            if (content['type'] == 'mp4'
                || content['type'] == 'video'
                || content['type'] == 'videoLink'
            ) {
                $scope.currentNodeAction.parent.videoFile = content;
            } else if (content['type'] == 'pdf'
                || content['type'] == 'pdfLink'
            ) {
                $scope.currentNodeAction.parent.pdfFile = content;
            }
        }
    };

    /**
     * remove all svg generated by js plumb.
     */
    $scope.destroyJSPlumb = function () {
        for (var i in $scope.jsPlumbConnections) {
            var conn = $scope.jsPlumbConnections[i].conn;
            jsPlumb.detach(conn);
        }

        $scope.jsPlumbConnections = [];
    };

    $scope.reInitiateJSPlumb = function (cb) {
        $scope.treeNodes = angular.copy($scope.treeNodes);
        $timeout(
            function () {
                $scope.$apply();
                $scope.initJSPlumb();

                if (cb) {
                    cb();
                }
            });
    };

    $scope.resourceIcon = function (filetype) {
        switch (filetype) {
            case 'pdf':
            case 'pdfLink':
                return 'fa fa-file-pdf-o';

            case 'mp4':
            case 'videoLink':
            case 'video':
                return 'fa fa-file-video-o';
        }
    };

    $scope.getDataShape = function (nodeType) {
        if (nodeType == 'subTopic')
            return 'Ellipse';

        return 'Rectangle';
    };

    $scope.requestIconAnalyitics = function (nodeId) {
        nodeId = nodeId.substring(1);
        if (nodeId == 'enter')
            return;

        $http.get('/api/server-widgets/topic-icon-analytics/?nodeId=' + nodeId).success(
            function (res) {
                $scope.isRequesting = false;
                if (res.result) {
                    $scope.widgets[nodeId] = $sce.trustAsHtml(res.widgets);
                }
            }
        ).error(function () {
            $scope.isRequesting = false;
        });
    };

    $scope.getContentNodeLink = function (d) {
        return '/treeNode/' + d._id + '/#/cid/' + $scope.course._id + '/nid/' + d._id;
    };

    $scope.deleteNode = function (data) {
        var msg = '';
        if (data.type == 'subTopic') {
            msg = 'Are you sure you want to delete this sub topic?';
        }
        else {
            msg = 'Are you sure you want to delete this content node?';
        }

        if (confirm(msg)) {
            $http({
                method: 'DELETE',
                url: '/api/treeNodes/' + data._id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (res) {
                    //console.log(res);
                    if (res.result) {
                        data.isDeleted = true;
                        data.name = '[DELETED]';

                        // destroy the jsplumb instance and svg rendered
                        $scope.destroyJSPlumb();

                        // this will reinitiate the model, and thus also jsplumb connection
                        $scope.reInitiateJSPlumb();

                    } else {
                        if (data.result != null && !data.result) {
                            $scope.errors = data.errors;
                            console.log(data.errors);
                        }
                    }
                });
        }
    };

    $scope.deleteNodeForever = function (data) {
        var msg = 'Are you sure you want to delete this content node forever?';
        if (data.type == 'subTopic') {
            msg = 'Are you sure you want to delete this sub topic forever?';
        }

        if (confirm(msg)) {
            $http({
                method: 'DELETE',
                url: '/api/treeNodes/' + data._id,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function (res) {
                    if (res.result) {
                        data.isDeleted = true;
                        data.isDeletedForever = true;
                        data.name = '[DELETED]';

                        // destroy the jsplumb instance and svg rendered
                        $scope.destroyJSPlumb();

                        // this will reinitiate the model, and thus also jsplumb connection
                        $scope.reInitiateJSPlumb();
                    }
                })
                .error(function (data) {
                    $scope.errors = data.errors;
                    toastr.error(data.errors);
                });
        }
    };

    $scope.isOwner = function (tn) {
        return tn.createdBy == $scope.user._id;
    };

    $scope.isAuthorized = function (tn) {
        return ($scope.isOwner(tn) || $scope.isAdmin || $scope.isManager);
    };

    $scope.addNewNodeIntoPool = function (treeNode) {
        if (treeNode.parent) {
            found = false;
            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode.parent);

            if (pNode) {
                pNode.childrens.push(treeNode);
            }
        }
        else
            $scope.treeNodes.push(treeNode);

        // destroy the jsplumb instance and svg rendered
        $scope.destroyJSPlumb();

        // this will reinitiate the model, and thus also jsplumb connection
        $scope.reInitiateJSPlumb(function () {
            if ($('.open').length > 0) {
                $('.open').removeClass('open');
                return true;
            }
        });
    };

    $scope.afterEditNode = function (treeNode) {
        if (treeNode) {
            found = false;
            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode._id);
            if (pNode) {
                pNode.name = treeNode.name;
            }
        }

        $timeout(
            function () {
                $scope.$apply();
            });
    };

    $scope.afterEditContentNode = function (treeNode) {
        if (treeNode) {
            found = false;
            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode._id);
            if (pNode) {
                pNode.name = treeNode.name;
                pNode.resources = [];
                if (treeNode.resources.length > 0) {
                    for (var i in treeNode.resources) {
                        pNode.resources.push(treeNode.resources[i]);
                    }
                }
            }
        }

        $timeout(
            function () {
                $scope.$apply();
            });
    };

    $scope.collapse = function (el) {
        var nodeId = el.substring(1);
        found = false;

        var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', nodeId);
        if (pNode) {
            var hide = collapseService.toggle(nodeId);
            $scope.collapseStatus[nodeId] = hide;
            collapseService.affectVisual(hide, pNode, nodeId);

            if (hide !== false) {
                $('#' + el).addClass('aborted');
            } else {
                $('#' + el).removeClass('aborted');
            }
        }
    };

    $scope.$on('onAfterCreateNode', function (event, treeNode) {
        $scope.addNewNodeIntoPool(treeNode);
    });

    $scope.$on('onAfterEditNode', function (event, treeNode) {
        $scope.afterEditNode(treeNode);
    });

    $scope.$on('onAfterEditContentNode', function (event, treeNode) {
        $scope.afterEditContentNode(treeNode);
    });

    $scope.$on('jsTreeInit', function (ngRepeatFinishedEvent) {
        $scope.isTreeInitiated = true;
    });

    $scope.$on('onAfterSetMode', function (event, course) {
        if ($scope.currentNodeAction.type == "contentNode") {
            $scope.parseResources();
        }
    });

    $scope.$watchGroup(['isTreeInitiated', 'isCurrentTabIsMap'], function (oldVal, newVal) {
        if ($scope.isTreeInitiated === true && $scope.isCurrentTabIsMap === true) {
            $scope.initJSPlumb();
        }
    });

    $scope.$watch(function () {
        return $location.search()
    }, function (newVal, oldVal) {
        var currentTab = $location.search().tab;
        if (currentTab == 'map') {
            $scope.isCurrentTabIsMap = true;
        }
    }, true);

    $(document).ready(function () {
        $scope.width = jQuery(window).width();
        $scope.height = jQuery(window).height();
        $scope.center = {x: $scope.width / 2, y: ($scope.height / 2) - 100};
    });

    $scope.tabOpened();

    socket.on('joined', function (data) {
        //console.log(JSON.stringify(data));
    });

    socket.on('positionUpdated', function (data) {
        if (authService.user && data.userId == authService.user._id)
            return;

        var nd = data.nodeId;
        if (nd) {
            var elName = 't' + nd;
            var lv = Tree.leaves[elName];
            if (lv) {
                lv.fromCenter.x = data.x + 70;
                lv.fromCenter.y = data.y + 5;
                var oldPos = lv.el.position();
                var newPos = lv.getNewPosition(Tree.w, Tree.h);

                var dx = newPos.x - oldPos.left;
                var dy = newPos.y - oldPos.top;

                $('#' + elName).attr("is-simulated", 'simulated');
                $('#' + elName).simulate("drag-n-drop", {dx: dx, dy: dy})
            }

            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', nd);
            if (pNode) {
                pNode.positionFromRoot = {x: data.x, y: data.y};

                $timeout(function () {
                    $scope.$apply();
                });
            }

        }
    });

    socket.on('nodeCreated', function (data) {
        if (authService.user && data.userId == authService.user._id)
            return;

        $scope.addNewNodeIntoPool(data);
        console.log('nodeCreated');
    });

    socket.on('nodeUpdated', function (data) {
        if (authService.user && data.userId == authService.user._id)
            return;

        if (data.type == 'contentNode') {
            $scope.afterEditContentNode(data);
        } else {
            $scope.afterEditNode(data);
        }

        console.log('nodeUpdated');
    });

    socket.on('nodeDeleted', function (data) {
        if (authService.user && data.userId == authService.user._id)
            return;

        found = false;
        var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', data.nodeId);
        if (pNode) {
            pNode.isDeleted = true;
            if (data.isDeletedForever)
                pNode.isDeletedForever = true;

            pNode.name = '[DELETED]';

            // destroy the jsplumb instance and svg rendered
            $scope.destroyJSPlumb();

            // this will reinitiate the model, and thus also jsplumb connection
            $scope.reInitiateJSPlumb();
        }

        console.log('nodeDeleted');
    })
});
