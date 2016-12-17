app.controller('aggregationController',['$scope','$sce','$http', function($scope,$sce,$http){

    $scope.posts=[];
    $scope.currentSpace= 'Public';
    $scope.query='';
    $scope.postTypes = ['all', 'video', 'audio', 'slide', 'doc', 'story', 'pdf', 'link'];
    $scope.sortTimes = ['newest', 'oldest'];
    $scope.postType = $scope.postTypes[0];
    $scope.sortTime = $scope.sortTimes[0];

    $scope.init=function(){
        $scope.loadlink();
        console.log("controller added");
    };

    $scope.loadlink=function(){
        $http.get('/api/learningHub/posts',{
            params:{
                courseId:002,
                type: $scope.postType,
                sortBy : $scope.sortTime
            }
        }).success(function(data){
            $scope.posts=data;
        }).error(function(data){
            console.log(data);
        })
    };

    $scope.search = function() {
        console.log('search');
        $http.post('/api/learningHub/search',{
            query: $scope.query
        }).success( function(data){
            $scope.posts = data;
        }).error( function (data){
            console.log(data);
        });
    };

    $scope.typeChange = function() {
        $scope.init();
    };

    $scope.spaceChange = function() {
        if($scope.currentSpace == 'Public'){
            $scope.currentSpace = 'Personal';

        }else{
            $scope.currentSpace = 'Public';
        }
    };

    $scope.$on('LinkForm', function(event, data){
        $scope.loadlink();
    });

    $scope.$on('LinkEditDelete', function(event, data){
        $scope.loadlink();
    });

}]);
