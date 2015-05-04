var app = angular.module('courseMapper', ['ngResource', 'ngRoute']);

app.filter('capitalize', function() {
    return function(input, all) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});;app.controller('CategoryListController', function($scope, $http, $rootScope) {

  $http.get('/api/catalogs/categories').success(function(data) {
    $scope.categories = data;
  });

  $scope.$on('sidebarInit', function(ngRepeatFinishedEvent) {
      $.AdminLTE.tree('.sidebar');
  });

});

app.controller('CourseListController', function($scope, $http, $rootScope) {
  $http.get('/api/catalogs/courses').success(function(data) {
    $scope.courses = data;
  });
});;app.controller('MainMenuController', function($scope, $http, $rootScope) {
    $http.get('/api/accounts').success(function(data) {
        $scope.user = data;
        $rootScope.user = data;
    });
});

app.controller('RightClickMenuController', function($scope, $http, $rootScope) {
    $scope.createTopic = function(name, event){

        if(!$rootScope.tree)
            $rootScope.tree = {};

        $rootScope.tree.topic = {
            name: name,
            subTopics: [],
            resources:[],
            position: {x:event.x, y:event.y}
        };

        console.log("creating topic");
    };

    $scope.createSubTopic = function(name, topic){
        /*
        if(topic){
            topic.push()
        }

        $rootScope.tree.course.subTopics.push({

        });
        */
        console.log("creating sub topic");
    }
});;app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/about', {
                templateUrl: '/static/about',
                controller: 'staticController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }]);


;app.controller('staticController', function($scope, $http, $rootScope) {

});;/**
 * to use this, create an element <cm-tree></cm-tree>
 */
app.directive('cmTree', function($timeout){

    /**
     * constructor of cm-tree
     */
    function link($scope, $element, $attrs, $ctrl){
        /**
         * d3 tree main object
         */
        $scope.vis = d3.select($element[0]).append("svg:svg")
            .attr("width", $attrs.width)
            .attr("height", $attrs.height)
            .attr("id", $attrs.el)
            .on("mousemove", function(){
                // Extract the click location
                var point = d3.mouse(this);
                $scope.mousePosition = {x: point[0], y: point[1] };
                console.log(point[0] + " -- " + point[1]);
            });
            /*.on("contextmenu", function(data, index) {
                //handle right click
                Menu.showMenu({pageX: $scope.mousePosition.x, pageY:$scope.mousePosition.y});

                //stop showing browser menu
                d3.event.preventDefault();
            })
            .on("click", function(){
                Menu.closeMenu();
            });*/

        $scope.options = $attrs;

        $ctrl.init($element, $scope);
    }

    var drag = d3.behavior.drag()
        .on("drag", dragmove);

    function dragmove(d) {
        var x = d3.event.x;
        var y = d3.event.y;
        d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
    }

    /**
     * when the svg has finished loading
     */
    $timeout(function () {
        initDraggableUI();
    });

    return {
        link: link,
        controller: 'TreeController',
        restrict: 'E'
    }
});

app.service('TreeService', function($document){
    var self = this;

    /**
     * a tree need a main topic
     */
    this.createMainTopic = function($scope, $params){
        var pos = $scope.mousePosition;
        $scope.vis.append("circle")
            .attr("transform", "translate(" + pos.x + "," + pos.y + ")")
            .attr("r", "45")
            .attr("class", "mainTopic");

        console.log("created main topic on " + pos.x + "," + pos.y );
    }

});

app.controller('TreeController', function($scope, $attrs, TreeService, $animate) {
    var self = this;

    this.init = function(element, directiveScope){
        self.$element = element;
        $scope = directiveScope;
        console.log("init treecrontoller called");
    };

    $scope.call = function($methodName, $params){
        TreeService[$methodName]($scope, $params);
    };
});

/**
 * create rightclick menu, init dragging for svg container
 */
function initDraggableUI(){
    var treeSVG = $('#treeSVG');

    // calculate containment
    var t = $("#tree");
    var wrapperOffset = t.offset();

    var containment = [
        t.width() - treeSVG.width() + wrapperOffset.left,
        $('#map').height() - treeSVG.height() + wrapperOffset.top,
        wrapperOffset.left + 5,
        wrapperOffset.top
    ];

    // enable canvas to be dragged along container
    treeSVG.draggable({
        containment: containment,
        drag: function(event) {
            //console.log($(this).css('top'));
        }
    });

    // enable rightclick open and close
    treeSVG.handleRightClick().handleLeftClick();

    console.log(containment);
};app.controller('widgetController', function($scope, $http, $rootScope) {
    $scope.initWidgetButton = function(){
        $.AdminLTE.boxWidget.activate();
    }
});

app.controller('WidgetListController', function ($scope, $http, $rootScope) {

    $scope.initData = function () {
        $http.get('/api/apps/user-profile').success(function (data) {
            $scope.widgets = data.widgets;
        });
    };

    $scope.initData();

    $scope.$on('init', function (event, args) {
        $scope.initData();

        $(window).resize();
    });

});