var app = angular.module('courseMapper', ['ngResource', 'ngRoute', 'ngCookies', 'xeditable', 'ngTagsInput']);

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

function arrayObjectIndexOf(myArray, searchObj, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchObj[property])
            return i;
    }
    return -1;
}

function removeObjectFromArray(myArray, searchObj, property){
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchObj[property])
        {
            myArray.splice(i, 1);
            return;
        }
    }
}

/**
 * https://scotch.io/quick-tips/how-to-encode-and-decode-strings-with-base64-in-javascript
 * @type {{_keyStr: string, encode: Function, decode: Function, _utf8_encode: Function, _utf8_decode: Function}}
 */
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

 ;app.controller('CategoryListController', function($scope, $http, $rootScope) {

    $http.get('/api/categories').success(function (data) {
        $scope.categories = data.categories;
    });

    $scope.$on('sidebarInit', function (ngRepeatFinishedEvent) {
        $.AdminLTE.tree('.sidebar');
    });

});
;app.controller('CourseController', function($scope, $filter, $http, $location, $routeParams) {
    $scope.course = null;
    $scope.enrolled = false;
    $scope.loc = $location.absUrl() ;
    $scope.courseId = $routeParams.courseId;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $http.get('/api/course/' + $scope.courseId).success(function(res){
        if(res.result)
            $scope.course = res.course;
    });

    $scope.enroll = function(){
        var url = '/api/course/' + $scope.course._id + '/enroll';
        $scope.loading = true;
        $http.put(url, {}).success(function(res){

        }).finally(function(){
            $scope.loading = false;
        });
    }
});;
app.controller('NewCourseController', function($scope, $filter, $http, $location) {
    $scope.course = {
        name: null,
        category: null,
        description: ''
    };

    $scope.createdDate = new Date();
    $scope.tagsRaw = null;

    $scope.saved = false;
    $scope.categories = [];

    $scope.loadTags = function(query) {
        return $http.get('/api/category/' + $scope.category._id + '/courseTags?query=' + query);
    };

    $scope.saveCourse = function() {
        if($scope.tagsRaw) {
            $scope.course.tags = JSON.stringify($scope.tagsRaw);
        }
        $scope.course.category = $scope.$parent.category._id;

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
                    $scope.$emit('onAfterCreateNewCourse');
                    window.location.href = '/course/' + data.course.slug + '/#/cid/' + data.course._id + '?new=1';
                } else {
                    if( data.result != null && !data.result){
                        $scope.errorName = data.errors;
                        console.log(data.errors);
                    }
                }
            }) ;
    };
});

;app.controller('CourseListController', function($scope, $rootScope, $http, $routeParams, $location) {
    $scope.slug = $routeParams.slug;

    // chosen filter
    $scope.filterTags = [];
    $scope.filterTagsText = [];
    // this will be displayed on the available filter
    $scope.availableTags = [];
    // the original list
    $scope.courseTags = [];
    $scope.category = null;
    $scope.courses = null;

    $scope.getCoursesFromThisCategory = function(){
        var url = '/api/category/' + $scope.category._id + '/courses';
        var t = [];
        if($scope.filterTags.length > 0) {
            for (var i in $scope.filterTags)
                t.push($scope.filterTags[i]._id);

            url += '?tags=' + t.join(',');
        }

        $http.get(url).success(function(data) {
            $scope.courses = data.courses;
        });
    };

    $scope.initTagFromSearch = function(){
        var tagSearch = $location.search();
        if(tagSearch && tagSearch.tags){
            var tags = tagSearch.tags.split(',');
            if(tags)
                for(var i in tags){
                    var tag = tags[i];
                    if($scope.availableTags)
                        for(var j in $scope.availableTags) {
                            var t = $scope.availableTags[j];
                            if (t.slug == tag)
                                $scope.applyFilter(t, true);
                        }
                }
        }

        $scope.getCoursesFromThisCategory();

        $scope.$watch(function(){ return $location.search() }, function(newVal, oldVal){
            if(newVal && newVal !== oldVal)
                $scope.getCoursesFromThisCategory();
        }, true);
    };

    $scope.applyFilter = function(tag, dontgo){
        if(arrayObjectIndexOf($scope.filterTags, tag, 'name') < 0){
            $scope.filterTags.push(tag);
            $scope.filterTagsText.push(tag.slug);
            removeObjectFromArray($scope.availableTags, tag, 'name');
            if(!dontgo)
                $scope.go();
        }
    };

    $scope.go = function(){
        if($scope.filterTags.length > 0)
            $location.search({tags: $scope.filterTagsText.join(',')} );
        else
            $location.search({});
    };

    $scope.removeFilter = function(tag){
        if(arrayObjectIndexOf($scope.availableTags, tag, 'name') < 0){
            $scope.availableTags.push(tag);
            removeObjectFromArray($scope.filterTags, tag, 'name');

            for (var i=$scope.filterTagsText.length-1; i>=0; i--) {
                if ($scope.filterTagsText[i] === tag.slug) {
                    $scope.filterTagsText.splice(i, 1);
                    break;
                }
            }
            $scope.go();
        }
    };

    /**
     * init category data by slug
     */
    $http.get('/api/category/' + $scope.slug ).success(function(data) {
        $scope.category = data.category;

        // once we get the complete category structure, we operate by id
        $http.get('/api/category/' + $scope.category._id + '/courseTags').success(function(data) {
            $scope.courseTags = data.courseTags;
            $scope.availableTags = data.courseTags;

            $scope.initTagFromSearch();
        });
    });
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
;app.controller('MainMenuController', function($scope, $http, $rootScope, $cookies) {
    $scope.rememberMe = false;

    $http.get('/api/accounts').success(function(data) {
        $scope.user = data;
        $rootScope.user = data;
    });

    if($cookies.rememberMe)
        $scope.rememberMe = $cookies.rememberMe;

    $scope.$watch('rememberMe', function(newVal, oldVal){
        if(newVal !== oldVal){
            $cookies.rememberMe = $scope.rememberMe;
        }
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
                controller: 'CourseListController',
                reloadOnSearch: false
            }).

            when('/cid/:courseId', {
                templateUrl: 'course_detail.html',
                controller: 'CourseController',
                reloadOnSearch: false
            }).

            otherwise({
                redirectTo: '/'
            });

        /*$locationProvider.html5Mode({enabled: true,
            requireBase: false});*/

    }]);

;app.controller('staticController', function($scope, $http, $rootScope) {

});;app.controller('widgetController', function($scope, $http, $rootScope) {
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