admin.controller('CategoryListController', function($scope, $http, $rootScope) {

  $scope.initData = function(){
    $http.get('/api/catalogs/categories').success(function(data) {
      $scope.categories = data;
    });
  }

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

admin.controller('CourseListController', function($scope, $http, $rootScope) {
  $http.get('/api/catalogs/courses').success(function(data) {
    $scope.courses = data;
  });
});