var admin = angular.module('courseMapperAdmin', ['ngResource', 'ngRoute']);

admin.filter('capitalize', function() {
    return function(input, all) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
});

;admin.controller('CategoryListController', function($scope, $http, $rootScope) {

  $scope.initData = function(){
    $http.get('/api/categories').success(function(data) {
      $scope.categories = data.categories;
    });
  };

  $scope.initData();

  $scope.$on('sidebarInit', function(ngRepeatFinishedEvent) {
    $.AdminLTE.tree('.sidebar');
  });

  $scope.$on('init', function(event, args){
    $scope.initData();
  });

});

admin.controller('categoryFormController', function($scope, $http){
    $scope.formData = [];

    $scope.processForm = function(catId) {
        var d = transformRequest($scope.formData[catId]);
        $http({
                method: 'POST',
                url: '/api/categories',
                data: d, // pass in data as strings
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .success(function(data) {
                console.log(data);
                if(data.result) {
                    // if successful, bind success message to message
                    $scope.newCategory = data.category;

                    $scope.$emit('init');
                }
            })
            .error(function(data){
                if(!data.result){
                    $scope.errorName = data.errors.name;
                    console.log(data.errors);
                }
            });
    };
});

admin.controller('tagFormController', function($scope, $http){
    $scope.formData = {};

    $scope.setCategory = function(cat){
        $scope.formData.category = cat;
    };

    $scope.processForm = function() {
        var d = transformRequest($scope.formData);
        $http({
            method: 'POST',
            url: '/api/courseTags',
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                console.log(data);
                if(data.result) {
                    // if successful, bind success message to message
                    $scope.newTag = data.tag;
                    $scope.$emit('init');
                }
            })
            .error(function(data){
                if(!data.result){
                    $scope.errorName = data.errors.name;
                    console.log(data.errors);
                }
            });
    };
});

admin.controller('courseFormController', function($scope, $http){
    $scope.formData = {};

    $scope.setCategory = function(cat){
        $scope.formData.category = cat;
    };

    $scope.processForm = function() {
        var d = transformRequest($scope.formData);
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
                    // if successful, bind success message to message
                    $scope.newCourse = data.course;
                    $scope.$emit('init');
                }
            })
            .error(function(data){
                if(!data.result){
                    $scope.errorName = data.errors.name;
                    console.log(data.errors);
                }
            });
    };
});

admin.controller('CourseListController', function($scope, $http, $rootScope) {
  $http.get('/api/courses').success(function(data) {
      $scope.courses = data.courses;
  });
});

admin.controller('categoryDetailController', function($scope, $http, $routeParams){
    $scope.category = '';
    $scope.courses = {};
    $scope.courseTags = {};

    $http.get('/api/category/' + $routeParams.category).success(function(data) {
        if(data.category){
            $scope.category = data.category;
            $scope.courseTags = data.category.courseTags;
        }
    });

    $scope.getCourses = function(){
        $http.get('/api/category/' + $scope.category.slug +'/courses').success(function(data) {
            $scope.courses = data.courses;
        });
    };

    $scope.getCourseTags = function(){
        $http.get('/api/category/' + $scope.category.slug +'/courseTags').success(function(data) {
            $scope.tags = data.courseTags;
        });
    };

    $scope.$watch('category', function(newValue, oldValue) {
        if ($scope.category) {
            $scope.getCourses();
            $scope.getCourseTags();
        }
    });

    $scope.initData = function(){
        $scope.getCourses();
        $scope.getCourseTags();
    };

    $scope.$on('init', function(event, args){
        $scope.initData();
    });

});;admin.controller('adminController', function($scope, $route, $routeParams, $location) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
});;admin.controller('MainMenuController', function($scope, $http, $rootScope) {
    $http.get('/api/accounts').success(function(data) {
        $scope.user = data;
        $rootScope.user = data;
    });
});;admin.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/categories', {
                templateUrl: '/cm-admin/categories',
                controller: 'adminController',
                resolve: {
                    pd: function( $q ) {
                        return( {
                            title: 'Manage Categories',
                            breads: [
                                {a: '', active: true, title: 'Categories'}
                            ]
                        } );
                    }
                }
            }).
            when('/categories/:category', {
                templateUrl: '/cm-admin/category',
                controller: 'adminController',
                resolve: {
                    pd: function( $q ) {
                        return( {
                            title: 'Manage Category',
                            breads: [
                                {a: '#/categories', active: false, title: 'Categories'}
                            ]
                        });
                    }
                }
            }).
            otherwise({
                redirectTo: '/cm-admin'
            });
    }]);


