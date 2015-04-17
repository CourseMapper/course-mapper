admin.controller('CategoryListController', function($scope, $http, $rootScope) {

  $scope.initData = function(){
    $http.get('/api/catalogs/categories').success(function(data) {
      $scope.categories = data;
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

function transformRequest(obj) {
    var str = [];
    for(var p in obj)
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    return str.join("&");
}

admin.controller('categoryFormController', function($scope, $http){
    $scope.formData = [];

    $scope.processForm = function(catId) {
        var d = transformRequest($scope.formData[catId]);
        $http({
                method: 'POST',
                url: '/api/catalogs/categories',
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
            url: '/api/catalogs/tags',
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
            url: '/api/catalogs/courses',
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
  $http.get('/api/catalogs/courses').success(function(data) {
    $scope.courses = data;
  });
});

admin.controller('categoryDetailController', function($scope, $http, $routeParams){
    $scope.category = '';
    $scope.courses = {};
    $scope.tags = {};

    $http.get('/api/catalogs/category/' + $routeParams.category).success(function(data) {
        if(data.category){
            $scope.category = data.category;
            $scope.tags = data.category.tags;
        }
    });

    $scope.getCourses = function(){
        $http.get('/api/catalogs/category/' + $scope.category.slug +'/courses').success(function(data) {
            $scope.courses = data.courses;
        });
    };

    $scope.getTags = function(){
        $http.get('/api/catalogs/category/' + $scope.category.slug +'/tags').success(function(data) {
            $scope.tags = data.tags;
        });
    };

    $scope.$watch('category', function(newValue, oldValue) {
        if ($scope.category) {
            $scope.getCourses();
            $scope.getTags();
        }
    });

    $scope.initData = function(){
        $scope.getCourses();
        $scope.getTags();
    };

    $scope.$on('init', function(event, args){
        $scope.initData();
    });

});