app.controller('aggregationController',['$scope','$sce','$http', function($scope,$sce,$http){

    $scope.posts=[];
    $scope.currentSpace= 'Public';
    $scope.query='';
    $scope.postTypes = ['all', 'video', 'audio', 'slide', 'doc', 'story', 'pdf', 'link'];
    $scope.sortTimes = ['newest', 'oldest'];
    $scope.postType = $scope.postTypes[0];
    $scope.sortTime = $scope.sortTimes[0];
    $scope.enabled = false;


    $scope.init=function(){
        if($scope.enabled){
            $scope.loadPersonal();
        }else{
            $scope.loadlink();
        }
    };

    $scope.loadlink=function(){
        $http.get('/api/learningHub/posts/',{
            params:{
                nodeId: $scope.treeNode._id,
                type: $scope.postType,
                sortBy : $scope.sortTime
            }
        }).success(function(data){
            $scope.posts=data;
            console.log(data);
        }).error(function(data){
            console.log(data);
        })
    };

    $scope.loadPersonal = function() {
        $http.get('/api/learningHub/personalPosts/'+ $scope.treeNode._id,{
            params:{
                type: $scope.postType,
                sortBy : $scope.sortTime
            }
        }).success(function(data){
            if(data[0]){
                $scope.posts=data[0].posts;
            }else{
                console.log("seting empty");
                $scope.posts = [];
            }

        }).error(function(data){
            console.log(data);
        })
    };

    $scope.search = function() {
        if($scope.query!="" && !$scope.enabled){
            $http.post('/api/learningHub/search/'+$scope.treeNode._id,{
                query: $scope.query
            }).success( function(data){
                $scope.posts = data;
            }).error( function (data){
                console.log(data);
            });
        }
    };

    $scope.typeChange = function() {
        $scope.init();
    };

    $scope.$on('LinkForm', function(event, data){
        $scope.loadlink();

    });

    $scope.$on('LinkEditDelete', function(event, data){
        if($scope.enabled){
            $scope.loadPersonal();
        }else{
            $scope.loadlink();
        }
    });

    $scope.$watch('enabled', function(){
        $scope.init();
    })

}]);
