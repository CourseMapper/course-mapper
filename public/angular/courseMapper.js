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
     * option parameter
     * @type {{width: number, height: number}}

    this.options = {
        width : 0,
        height : 0
    };*/


    /**
     * d3 tree main object
     */
    this.vis = {};

    /**
     * constructor of cm-tree
     */
    function link($scope, $el, $attr){

        $scope.vis = d3.select($el[0]).append("svg:svg")
            .attr("width", $attr.width)
            .attr("height", $attr.height)
            .attr("on-finish-render", "initDraggableUI")
            .attr("id", $attr.el);

        createMainTopic($scope, $el, $attr);

        $scope.options = $attr;
    }

    /**
     * a tree need a main topic
     */
    function createMainTopic($scope, $el, $attr){
        var pos = {x:300, y:300};
        $scope.vis.append("circle")
            .attr("transform", "translate(" + pos.x + "," + pos.y + ")")
            .attr("r", "45")
            .attr("class", "mainTopic");
    }

    var drag = d3.behavior.drag()
        .on("drag", dragmove);

    function dragmove(d) {
        var x = d3.event.x;
        var y = d3.event.y;
        d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
    }

    $timeout(function () {
        //DOM has finished rendering
        initDraggableUI();
    });

    return {
        link: link,
        restrict: 'E'
    }
});

function initDraggableUI(){
    var treeSVG = $('#treeSVG');
    // enable rightclick open and close
    treeSVG.handleRightClick().handleLeftClick();

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

    console.log(containment);
}

app.controller('TreeController', function($scope, $http, $rootScope) {


});;app.controller('widgetController', function($scope, $http, $rootScope) {
    $scope.initWidgetButton = function(){
        $.AdminLTE.boxWidget.activate();
    }
});
