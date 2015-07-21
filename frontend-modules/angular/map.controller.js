app.controller('MapController', function($scope, $http, $rootScope, $timeout) {
    $scope.treeNodes = [];
    $scope.jsPlumbConnections = [];

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
    $scope.findNode = function(obj, col, searchKey, searchValue){
        if(found)
            return found;

        for(var i in obj){
            var tn = obj[i];

            if(tn[searchKey] && tn[searchKey] == searchValue) {
                found = tn;
                return tn;
            }
            else if(tn[col] && tn[col].length > 0){
                // search again
                $scope.findNode(tn[col], col, searchKey, searchValue);
            }
        }

        if(found)
            return found;
    };

    $(document).ready(function(){
        $scope.width = jQuery(window).width();
        $scope.height = jQuery(window).height();
        $scope.center = {x:$scope.width/2, y: ($scope.height/2)-100};
    });

    /**
     * get all categories, recursived on the server
     */
    $scope.init = function(){
        // add hover to center instantiate on hover
        $('.center-course').mouseover(function(){
            $(this).find('ul').show();
        }).mouseout(function(){$(this).find('ul').hide()});

        // get node data
        $http.get('/api/treeNodes/course/' + $scope.course._id ).success(function (data) {
            if(!data.result)
                console.log(data.errors);
            else
                if(data.treeNodes.length > 0) {
                    $scope.treeNodes = data.treeNodes;
                }
                else
                    $scope.initJSPlumb();
        });
    };

    $scope.$on('onAfterInitCourse', function(event, course){
        $scope.course = course;
        $scope.init();
    });

    // initiate draggable jqUI to the topic node
    $scope.initDraggable = function (jsPlumbInstance){
        var w = window.innerWidth;
        var h = window.innerHeight;

        // let us drag and drop the cats
        var mapEl = jsPlumb.getSelector(".course-map .w");
        jsPlumbInstance.draggable(mapEl,{
            // update position on drag stop
            stop: function() {
                var el = $(this);
                var pos = el.position();
                var distanceFromCenter = {
                    x: pos.left - Canvas.w/2,
                    y: pos.top - Canvas.h/2
                };

                var nId = el.attr('id').substring(1); // remove 't' from the node id
                found = false;
                var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', nId);

                $http.put('/api/treeNodes/' + nId + '/positionFromRoot', distanceFromCenter)
                    .success(function(res, status){
                        console.log(res);
                        if(pNode)
                            pNode.positionFromRoot = distanceFromCenter;
                    })
                    .error(function(res, status){
                        console.log('err');
                        console.log(res);
                    });
            }
        });
    };

    $scope.initJSPlumb = function(){
        Tree.init(Canvas.w, Canvas.h);

        var instance = jsPlumb.getInstance({
            Endpoint: ["Blank", {radius: 2}],
            HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            PaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            ConnectionOverlays: [ ],
            Container: "course-map"
        });

        $scope.initDraggable(instance);

        // initialise all '.w' elements as connection targets.
        instance.batch(function () {
            /* connect center to first level cats recursively*/
            $scope.interConnect('center', $scope.treeNodes, instance);
        });
    };

    $scope.interConnect = function(parent, treeNodes, instance){
        // added "t" in id because id cannot start with number
        for(var i in treeNodes){
            var child = treeNodes[i];
            var childId = 't' + child._id;

            // instantiate on hover
            $('#' + childId).mouseover(function(){
                $(this).find('ul').show();
            }).mouseout(function(){$(this).find('ul').hide()});

            // connecting parent and chidlern
            var conn = instance.connect({
                source: parent, target: childId,
                anchors: [
                    [ "Perimeter", { shape: jsPlumb.getSelector('#' + parent)[0].getAttribute("data-shape") }],
                    [ "Perimeter", { shape: jsPlumb.getSelector('#' + childId)[0].getAttribute("data-shape") }]
                ]
            });

            $scope.jsPlumbConnections.push(conn);

            if(child.childrens) {
                $scope.interConnect(childId, child.childrens, instance);
            }
        }
    };

    $scope.goToDetail = function(categorySlug){
        window.location.href = "/courses/#/category/" + categorySlug;
    };

    $scope.nodeModaltitle = "";
    $scope.currentNodeAction = {};
    $scope.setMode = function(mode, type, parent){
        switch(mode){
            case 'add':
                $scope.currentNodeAction.mode = "Add";
                break;
            case 'edit':
                $scope.currentNodeAction.mode = "Edit";
                break;
        }

        switch(type){
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

        if(parent) {
            $scope.currentNodeAction.parent = parent;
            $scope.nodeModaltitle += " under " + parent.name;
        }
        else
            $scope.currentNodeAction.parent = false;

        $rootScope.$broadcast('onAfterSetMode', $scope.$parent.course);
    };

    $scope.$on('jsTreeInit', function (ngRepeatFinishedEvent) {
        console.log(ngRepeatFinishedEvent);
        $scope.initJSPlumb();
    });

    $scope.$on('onAfterCreateNode', function(event, treeNode){
        if(treeNode.parent) {
            found = false;
            var pNode = $scope.findNode($scope.treeNodes, 'childrens', '_id', treeNode.parent);

            if(pNode) {
                pNode.childrens.push(treeNode);
            }
        }
        else
            $scope.treeNodes.push(treeNode);

        // destroy the jsplumb instance and svg rendered
        $scope.destroyJSPlumb();

        // this will reinitiate the model, and thus also jsplumb connection
        $scope.treeNodes = angular.copy($scope.treeNodes);
        $timeout(
            function(){
                $scope.$apply();
            });
    });

    /**
     * remove all svg generated by js plumb.
     */
    $scope.destroyJSPlumb = function(){
        //jsPlumb.removeAllEndpoints('#course-map', true);
        for(var i in $scope.jsPlumbConnections){
            var conn = $scope.jsPlumbConnections[i];
            jsPlumb.detach(conn);
        }

        $scope.jsPlumbConnections = [];
    };

    $scope.resourceIcon = function(filetype){
        switch(filetype){
            case 'pdf':
                return 'fa fa-file-pdf-o';

            case 'mp4':
                return 'fa fa-file-video-o';

            case 'video':
                return 'fa fa-file-video-o';
        }
    }

    $scope.getDataShape = function(nodeType){
        if(nodeType == 'subTopic')
            return 'Ellipse';

        return 'Rectangle';
    }
});
