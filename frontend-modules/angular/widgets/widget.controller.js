app.controller('widgetController', function($scope, $http, $rootScope, $ocLazyLoad, $timeout) {
    $scope.location = "";
    $scope.widgets = [];
    $scope.widgetsTemp = [];

    $scope.initWidgetButton = function(id){
        $.AdminLTE.boxWidget.activate();
        $scope.addWidget(id);

        var h = $('#w' + id + ' .grid-stack-item-content');
        $('#w' + id + ' .grid-stack-item-content .box-body').css('height', (h.innerHeight() - 40) + 'px');
    };

    $scope.$on('onAfterInitUser', function(event, user){
        $scope.$watch('location', function(newVal, oldVal){
            if($scope.location == 'user-profile'){
                $scope.getWidgets();
            }
        });
    });

    $scope.$on('onAfterInitCourse', function(event, course){
        $scope.course = course;
        $scope.getWidgets();
    });

    $scope.$watch('location', function(newVal, oldVal) {
        if($scope.location == '')
            return;

        var onafter = 'onAfterInstall' + $scope.location;
        $scope.$on(onafter, function (event, newWidget) {
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets();
        });

        var onafter2 = 'onAfterUninstall' + $scope.location;
        $scope.$on( onafter2, function(event, newWidget){
            // remove all widget in the page
            var grid = $('#' + $scope.location + '-widgets').data('gridstack');
            grid.remove_all();

            $scope.getWidgets();
        });

    });

    $scope.lazyLoad = function(wdg, currentIndex, widgetJsArray, fileToLoad){
        (function(wdg) {
            var jsfn = '/' + wdg.application + '/' + fileToLoad;

            $ocLazyLoad.load(jsfn).then(function() {
                // the last one has been loaded
                var l = wdg.widgetId.widgetJavascript.length - 1;
                if(fileToLoad == wdg.widgetId.widgetJavascript[l]){
                    // only push to main widgets array when it is the last js to load
                    $scope.widgets.push(wdg);
                } else {
                    var nextFile = widgetJsArray[currentIndex++];
                    $scope.lazyLoad(wdg, currentIndex, widgetJsArray, nextFile);
                }
            });
        })(wdg);
    };

    $scope.getWidgets = function(){
        var id = "";

        if($scope.location == 'user-profile')
            id = $rootScope.user._id;

        else if($scope.location == 'course-preview' || $scope.location == 'course-analytics')
            id = $scope.course._id;

        $http.get('/api/widgets/' + $scope.location + '/' + id).success(function (data) {
            $scope.widgetsTemp = data.widgets;
            $scope.widgets = [];

            $rootScope.$broadcast('onAfterGetWidgets' + $scope.location, $scope.widgetsTemp);

            for(var i in $scope.widgetsTemp){
                var wdg = $scope.widgetsTemp[i];

                // loop to load the js (if exist)
                if(wdg.widgetId.widgetJavascript) {
                    //if(wdg.widgetId.widgetJavascript.type() == 'Array'){
                    //for(var j = 0; j < wdg.widgetId.widgetJavascript.length; j++)
                    //var loading = true;


                    $scope.lazyLoad(wdg, 0, wdg.widgetId.widgetJavascript, wdg.widgetId.widgetJavascript[0]);
                    //}

                } else {
                    $scope.widgets.push(wdg);
                }
            }
        });
    };

    $scope.addWidget = function(id){
        var loc = '#' + $scope.location + '-widgets';
        var grid = $(loc).data('gridstack');

        var el = '#w' + id;

        // get width and height
        var i = _.findIndex($scope.widgets, { 'widgetId': {'_id' : id}});
        var wdg = $scope.widgets[i];

        //add_widget(el, x, y, width, height, auto_position)
        var x = 0;
        var y = 0;
        if(wdg.position){
            x = wdg.position.x;
            y = wdg.position.y;
        }
        grid.add_widget(el, x, y, wdg.width, wdg.height, false);
    };

    $scope.closeWidget = function(id){
        var i = _.findIndex($scope.widgets, { 'widgetId': {'_id' : id}});
        var wdg = $scope.widgets[i];

        $rootScope.$broadcast('onAfterCloseButtonClicked' + $scope.location, wdg);
    };

    $scope.initiateDraggableGrid = function(locs){
        $scope.location = locs;
        var loc = '#' + locs + '-widgets';

        var options = {
            cell_height: 340,
            vertical_margin: 10,
            resizable: false
            //allowed_grids: [0, 4, 8]
        };

        var curNode = {x:0, y:0};

        var $gs = $(loc);
        $gs.gridstack(options);

        $gs.on('onStartMove', function (e, node) {
            curNode.x = node.x;
            curNode.y = node.y;
        });

        $gs.on('onMove', function (e, node) {

        });

        $gs.on('onFinishDrop', function (e, node) {
            var o = $(node.el);

            if(options.allowed_grids && options.allowed_grids.indexOf(node.x) < 0){
                o.attr('data-gs-x', curNode.x).attr('data-gs-y', curNode.y);
            }

            var wId = o.attr('id').substr(1);
            $scope.setPosition(wId, node.x, node.y);
        });
    };

    $scope.setPosition = function(wId, x, y){
        $http.put('/api/widget/' + wId + '/setPosition', {
            x:x, y:y
        }).success(function(res){
            /*if(res.result)
            {
                console.log('set position success');
            }*/
        });
    };

});
