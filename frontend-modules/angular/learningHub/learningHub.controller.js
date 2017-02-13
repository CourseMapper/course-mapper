app.controller('aggregationController',['$scope','$sce','$http', function($scope,$sce,$http){
    /**
     * Declare and initialise the posts[], postType(s), sortTime(s),enabled(personal space)
     */
    $scope.posts=[];
    $scope.currentSpace= 'Public';
    $scope.query='';
    $scope.postTypes = ['all', 'video', 'audio', 'slide', 'doc', 'story', 'pdf', 'link'];
    $scope.sortTimes = ['newest', 'oldest'];
    $scope.postType = $scope.postTypes[0];
    $scope.sortTime = $scope.sortTimes[0];
    $scope.enabled = false;


    /**
     * initialize the environment i.e either public or personal
     */
    $scope.init=function(){
        if($scope.enabled){
            $scope.loadPersonal();
        }else{
            $scope.loadlink();
        }
    };

    /**
     * get all the posts for public space
     */
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

    /**
     * get all the posts for persoanl space
     */
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

    /**
     * search for the posts based on search query
     */
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

    /**
     * select types of posts
     */
    $scope.typeChange = function() {
        $scope.init();
    };

    $scope.$on('LinkForm', function(event, data){
        $scope.loadlink();

    });

    /**
     * handle the post edit and delete event emitted in hublink.js
     */
    $scope.$on('LinkEditDelete', function(event, data){
        if($scope.enabled){
            $scope.loadPersonal();
        }else{
            $scope.loadlink();
        }
    });

    /**
     * handle the toggle between the personal and private space
     */
    $scope.$watch('enabled', function(){
        $scope.init();
    })

}]);
