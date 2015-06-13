var app = angular.module('courseMapper', ['ngResource', 'ngRoute', 'xeditable']);

app.filter('capitalize', function() {
    return function(input, all) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

app.filter('base64Encode', function() {
    return function(input, all) {
        return (!!input) ? Base64.encode(input) : '';
    }
});

app.filter('base64Decode', function() {
    return function(input, all) {
        return (!!input) ? Base64.decode(input) : '';
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
});

/**
 * xeditable
 */
app.run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

/**
 * encode uri component for post request parameter
 *
 * @param obj
 * @returns {string}
 */
function transformRequest(obj) {
    var str = [];
    for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
}

/**
 * https://scotch.io/quick-tips/how-to-encode-and-decode-strings-with-base64-in-javascript
 * @type {{_keyStr: string, encode: Function, decode: Function, _utf8_encode: Function, _utf8_decode: Function}}
 */
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
;app.controller('CategoryListController', function($scope, $http, $rootScope) {

    $http.get('/api/categories').success(function (data) {
        $scope.categories = data.categories;
    });

    $scope.$on('sidebarInit', function (ngRepeatFinishedEvent) {
        $.AdminLTE.tree('.sidebar');
    });

});;app.controller('CourseController', function($scope, $filter, $http, $location) {
    $scope.course = null;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?follow=1';
});


app.controller('CourseListController', function($scope, $rootScope, $http, $routeParams, $location) {
    $scope.slug = $routeParams.slug;

    //api/category/:category/courses
    //api/category/:category/tags

    $http.get('/api/category/' + $scope.slug + '/courses').success(function(data) {
        $scope.courses = data.courses;
    });

    $http.get('/api/category/' + $scope.slug + '/tags').success(function(data) {
        $scope.tags = data.tags;
    });


});

app.controller('NewCourseController', function($scope, $filter, $http, $location) {
    $scope.course = {
        course: null,
        category: null,
        description: '',
        _id: null
    };

    $scope.createdDate = new Date();

    $scope.saved = false;
    $scope.categories = [];

    $scope.def = {
        course: 'Untitled course',
        description: 'This should be a text that explains generally about this course',
        category: 'Please pick a category'
    };

    $scope.loadCategories = function() {
        return $scope.categories.length ? null : $http.get('/api/categories').success(
            function(data) {
                $scope.categories = data.categories;
            });
    };

    $scope.loadCategories();

    $scope.$watch('course.category', function(newVal, oldVal) {
        console.log(newVal);
        if (newVal !== oldVal) {
            var selected = $filter('filter')($scope.categories, {slug: $scope.course.category});
            $scope.course.category = selected.length ? selected[0].slug : null;
        }
    });

    /**
     * check if the creator has added a course or category/ and not just a default value
     * this is an initial saving to create a new course record in DB

    $scope.$watch('course', function(newVal, oldVal){
        if(
            newVal.course && newVal.course !== $scope.def.course &&
            newVal.category && newVal.category !== $scope.def.category
        ){
            $scope.saveCourse();
        }
    }, true);*/


    $scope.saveCourse = function() {
        var d = transformRequest($scope.course);
        $http({
            method: 'POST',
            url: '/api/courses',
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                console.log(data);
                if(data.result) {
                    // if successful, bind success data.course to course
                    $scope.courseModel = data.course;
                    $scope.course._id = data.course._id;
                    $scope.saved = true;

                    $scope.$emit('onAfterCreateNewCourse');

                    window.location.href = '/course/' + $scope.course._id + '?new=1';
                }
            })
            .error(function(data){
                if( data.result != null && !data.result){
                    $scope.errorName = data.errors.name;
                    console.log(data.errors);
                }
            });
    };

    /**
     * this watch is for an create new course use case.
     * we disable all tabs except 1st one, and enable it once we obtained course._id from server

    $scope.$watch('course._id', function(newVal, oldVal){
        if($scope.course._id && $scope.saved){
            $location.path('/course/' + $scope.course._id);
            $location.replace();

            // enable all tabs
            //$('#courseNavigationTabs ul li').removeClass('disabled');
            //var a = $('#courseNavigationTabs ul li a');
            //a.attr('data-toggle', 'tab');
            //a.attr('href', a.attr('data-href'));
        }
    });*/

    $scope.initAutoGrow = function(){
        if(jQuery().autoGrowInput) {
            jQuery('#courseTitle input[type=text]').autoGrowInput({ minWidth: 200, maxWidth: 600, comfortZone: 10 });
        }
    }
});

;app.controller('HomePageController', function($scope, $http, $rootScope) {
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
        console.log((ngRepeatFinishedEvent));
        $scope.initJSPlumb();
    });

    $scope.initJSPlumb = function(){
        var instance = jsPlumb.getInstance({
            Endpoint: ["Blank", {radius: 2}],
            HoverPaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            PaintStyle: {strokeStyle: "#3C8DBC", lineWidth: 2 },
            ConnectionOverlays: [ ],
            Container: "category-map"
        });

        // so the ejs can access this instance
        $rootScope.initDraggable(instance, $scope.center);

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

            //$('#' + child.slug).dropdown('toggle');

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
;app.controller('MainMenuController', function($scope, $http, $rootScope) {
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
});;app.config(['$routeProvider', '$locationProvider',

    function($routeProvider, $locationProvider) {

        $routeProvider.
            when('/static/about', {
                templateUrl: '/static/about',
                controller: 'staticController'
            }).

            when('/category/:slug', {
                templateUrl: 'courses_list.html',
                controller: 'CourseListController'
            }).

            otherwise({
                redirectTo: '/'
            });

        /*$locationProvider.html5Mode({enabled: true,
            requireBase: false});*/

    }]);

;app.controller('staticController', function($scope, $http, $rootScope) {

});;$model = {
    'type': 'main',
    'course': 'Web Tech',
    'subNodes': [
        {
            'type': 'subTopic',
            'name': 'server technology',
            'resources':[

            ],
            'position':{x:10, y:10},
            'subNodes':[
                {
                    'type': 'pdf',
                    'url': 'http://journal.r-project.org/archive/2014-1/murrell-potter.pdf'
                },
                {
                    'type': 'subTopic',
                    'name': 'server technology'
                }
            ]
        }
    ]
};

/**
 * call this to allow dragging on your svg element el.call(drag)
 */
var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

function dragged(d) {
    d3.select(this)
        .attr("cx", d3.event.x)
        .attr("cy", d3.event.y)
        .attr('data-x', d3.event.x)
        .attr('data-y', d3.event.y);
}

function dragended(d) {
    d3.select(this).classed("dragging", false);
}

/**
 * to use this, create an element <cm-tree></cm-tree>
 */
app.directive('cmTree', function($timeout){

    /**
     * constructor of cm-tree
     */
    function link($scope, $element, $attrs, $ctrl){
        $scope.options = $attrs;

        /**
         * enable zoom and panning behaviour. call this by el.call(zoom)
         */
        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on("zoom", zoomed);

        function zoomed() {
            $scope.container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        /**
         * data structure for subTopic
         */
        $scope.subTopic = function (){
            this.name = "New Topic";
        };

        /**
         * d3 tree main object
         */
        $scope.vis = d3.select($element[0]).append("svg")
            .attr("width", $attrs.width)
            .attr("height", $attrs.height)
            .attr("id", $attrs.el)

            //draggable and zoomable
                .append("g")
                .attr("transform", "translate(" + 0 + "," + 0 + ")")
                .call(zoom);

        // rectangle so we can drag the map
        $scope.vis.append("rect")
            .attr("width", $attrs.width)
            .attr("height", $attrs.height)
            .style("fill", "none")
            .style("pointer-events", "all");

        $scope.container = $scope.vis.append("g");
        /**
         * axis x lines
         */
        $scope.container.append("g")
            .attr("class", "x axis")
            .selectAll("line")
            .data(d3.range(0, $attrs.width, 10))
            .enter().append("line")
            .attr("x1", function(d) { return d; })
            .attr("y1", 0)
            .attr("x2", function(d) { return d; })
            .attr("y2", $attrs.height);

        /**
         * axis y lines
         */
        $scope.container.append("g")
            .attr("class", "y axis")
            .selectAll("line")
            .data(d3.range(0, $attrs.height, 10))
            .enter().append("line")
            .attr("x1", 0)
            .attr("y1", function(d) { return d; })
            .attr("x2", $attrs.width)
            .attr("y2", function(d) { return d; });

        $ctrl.init($element, $scope);
    }

    /**
     * when the svg has finished loading
     */
    $timeout(function () {
        //initDraggableUI();
        initMapContainer();
    });

    return {
        link: link,
        controller: 'TreeController',
        restrict: 'E'
    }
});

app.service('TreeService', function($document){
    var self = this;

    function showMenu(){
        var matrix = this.getScreenCTM()
            .translate(+this.getAttribute("cx"),
            +this.getAttribute("cy"));

        var absoluteHTMLtooltip = d3.select("div#rightClick");
        absoluteHTMLtooltip
            .style("left",
            (window.pageXOffset + matrix.e) + "px")
            .style("top",
            (window.pageYOffset + matrix.f + 30) + "px");

        //var p = {pageX :rect.left, pageY:rect.top}
        Menu.showMenu();
        //d3.select(this).classed('displayNone',true);
    }

    function hideMenu(){
        //Menu.closeMenu(d3.event);
        d3.select(this).classed('displayNone',false);
    }

    /**
     * a tree need a main topic
     */
    this.createSubTopic = function($scope, $params){
        var sT = new $scope.subTopic();

        $scope.course.subTopics.push(sT);

        var sTCircle = '';

        //var pos = $scope.mousePosition;
        $scope.container.append(newSubTopic)
            .attr("transform", "translate(" + $params.pos.x + "," + $params.pos.y + ")")
            .attr("r", "45")
            .attr("class", "mainTopic");

        console.log("created sub topic on " + $params.pos.x + "," + $params.pos.y );
    };

    /**
     * a tree need a main topic
     */
    this.createCenter = function($scope, $params){
        var g = $scope.container.append('g')
            .attr("transform", "translate(" + $params.pos.x + "," + $params.pos.y + ")")
            .attr("data-x", $params.pos.x)
            .attr("data-y", $params.pos.y)
            .attr("cx", function(d) { return $(this).attr('data-x'); })
            .attr("cy", function(d) { return $(this).attr('data-y'); });

        var circle = g.append("circle")
            .attr("r", "65")
            .attr("class", "mainTopic");

        // menu icon
        var menu = g.append("image")
            .attr("xlink:href","/img/tree/icon-menu.svg")
            .classed('iconMenu',true)
            .attr('transform', 'translate(-65,-65)')
            .attr("width", 16)
            .attr("height", 16)
            .on("mouseover", showMenu);
            //.on("mouseout", hideMenu);

        var text = g.append('text')
            //.attr("transform", "translate(" + 65 + "," + 65 + ")")
            .text($scope.course.course).attr('text-anchor','middle')
            .attr("class", "mainTopicText");

        console.log("createCenter on " + $params.pos.x + "," + $params.pos.y );
    }

});

app.controller('TreeController', function($scope, $http, $attrs, TreeService, $animate) {
    var self = this;

    this.init = function(element, directiveScope){
        self.$element = element;
        $scope = directiveScope;

        console.log("init treecrontoller called");

        /**
         * to get basic data of a course
         */
        var parser = document.createElement('a');
        parser.href = $scope.currentUrl;
        var k = parser.pathname.split('/');
        $scope.courseId = k[k.length - 1];

        // get the course object
        $http.get('/api/course/' + $scope.courseId).success(function (data) {
            $scope.course = data.course;

            // create the center circle for this course
            $scope.call('createCenter', {
                pos: {
                    x: (parseInt($scope.options.width)/2),
                    y: (parseInt($scope.options.height)/2)
                },
                text: $scope.course.course
            });
        });
    };

    $scope.$watch('course', function(newVal, oldVal){
        if(newVal != null){

        }
    });

    // reflection function, to call method on tree service by string
    $scope.call = function($methodName, $params){
        TreeService[$methodName]($scope, $params);
    };
});

/**
 * create rightclick menu, init dragging for svg container
 */
function initMapContainer(){
    var t = $('#map');
    $("#tree svg").each(function(i, svg) {
        $(svg).css({
            position: "relative",
            left: (t.width()/2) - ($(svg).width()/2),
            top:(t.height()/2) - ($(svg).height()/2)
        });
    });
}

function initDraggableUI(){
    var treeSVG = $('#treeSVG');
    // enable rightclick open and close
    treeSVG.handleRightClick().handleLeftClick();
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