app.controller('aggregationController',['$scope','$sce','$http', function($scope,$sce,$http){
    /**
     * Declare and initialise the posts[], postType(s), sortTime(s),enabled(personal space)
     */
    $scope.posts = [];
    $scope.personalPosts=[];
    //console.log("here");
    $scope.currentSpace= 'Public';
    $scope.query='';
    $scope.enabled = false;
    $scope.sort = "";

    /**
     * Initialize for pagination
     */
    $scope.currentPagePublic = 1;
    $scope.currentPagePersonal = 1;
    $scope.postsLength = 0;
    $scope.personalPostsLength = 0;
    $scope.publicView = [];
    $scope.personalView = [];
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
                sortBy : $scope.sortTime,
                searchQuery : $scope.query
            }
        }).success(function(data){
            $scope.postsLength = data.length;
            $scope.posts = data;
            $scope.publicView = [];
            $scope.publicView = $scope.postsSlice($scope.posts, $scope.currentPagePublic);
        }).error(function(data){
            console.log(data);
        });
    };

    /**
     * get all the posts for persoanl space
     */
    $scope.loadPersonal = function() {
        $http.get('/api/learningHub/personalPosts/'+ $scope.treeNode._id,{
            params:{
                type: $scope.postType,
                sortBy : $scope.sortTime,
                searchQuery : $scope.query
            }
        }).success(function(data){
                $scope.personalPostsLength = data.length;
                $scope.personalPosts = data;
                $scope.personalView = [];
                $scope.personalView = $scope.postsSlice($scope.personalPosts, $scope.currentPagePersonal);

        }).error(function(data){
            console.log(data);
        });
    };

    /**
     * search for the posts based on search query
     */
    $scope.search = function() {
        $scope.init();
    };

    /**
     * select types of posts
     */
    $scope.typeChange = function() {
        if($scope.sortTime === 'votes'){
            $scope.sort = "voteDisplay";
        }else{
            $scope.sort="";
            $scope.init();
        }
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
        $scope.postTypes = ['all', 'video', 'audio', 'slide', 'doc', 'story', 'pdf', 'link'];
        $scope.sortTimes = $scope.enabled ? ['Newest First', 'Oldest First'] : ['Newest First', 'Oldest First', 'Most Popular', 'Most Commented'];
        $scope.sortTime = $scope.sortTimes[0];
        $scope.postType = $scope.postTypes[0];
        $scope.init();
    });

    $scope.publicPageChanged = function(){
        $scope.publicView = [];
        $scope.publicView = $scope.postsSlice($scope.posts, $scope.currentPagePublic);
    };

    $scope.personalPageChanged = function(){
        $scope.personalView = [];
        $scope.personalView = $scope.postsSlice($scope.personalPosts, $scope.currentPagePersonal);
    };

    $scope.postsSlice = function(p,currentPage){
        var len = p.length;
        var end = currentPage * 10;
        var start = end -10;
        if(end > len){
            end = start + (len % 10);
        }
       console.log(p.slice(start, end));
        return p.slice(start, end);
    };

}]);
