app.
    controller('DiscussionController', function($scope, $http, $location) {
        $scope.formData = {};
        $scope.course = {};
        $scope.currentReplyingTo = false;
        $scope.currentEditPost = {};
        $scope.currentTopic = {};

        $scope.menu = [
            ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
            [ 'font-size' ],
            ['ordered-list', 'unordered-list', 'outdent', 'indent'],
            ['left-justify', 'center-justify', 'right-justify'],
            ['code', 'quote', 'paragraph']
        ];

        $scope.topics = [];
        $scope.replies = [];

        $scope.$on('onAfterInitCourse', function(e, course){
            $scope.course= course;

            $http.get('/api/discussions/' + course._id).success(function(res){
               if(res.result && res.posts){
                   $scope.topics = res.posts;
               }
            });
        });

        $scope.saveNewPost = function(){
            console.log('saving');

            var d = transformRequest($scope.formData);
            $http({
                method: 'POST',
                url: '/api/discussions/' + $scope.course._id,
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function(data) {
                    console.log(data);
                    if(data.result) {
                        $scope.$emit('onAfterCreateNewTopic', data.post);

                        $('#addNewTopicModal').modal('hide');
                    } else {
                        if( data.result != null && !data.result){
                            $scope.errorName = data.errors;
                            console.log(data.errors);
                        }
                    }
                }) ;
        };

        $scope.saveEditPost = function(){
            console.log('saving edit post');

            var d = transformRequest($scope.currentTopic);
            $http({
                method: 'PUT',
                url: '/api/discussion/' + $scope.currentTopic._id,
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function(data) {
                    console.log(data);
                    if(data.result) {
                        $scope.$emit('onAfterEditTopic', data.post);

                        $('#editTopicModal').modal('hide');
                    } else {
                        if( data.result != null && !data.result){
                            $scope.errorName = data.errors;
                            console.log(data.errors);
                        }
                    }
                }) ;
        };

        $scope.deletePost = function(postId){
            $http({
                method: 'DELETE',
                url: '/api/discussion/' + postId,
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function(data) {
                    console.log(data);
                    if(data.result) {
                        $scope.$emit('onAfterDeletePost', postId);

                    } else {
                        if( data.result != null && !data.result){
                            $scope.errorName = data.errors;
                            console.log(data.errors);
                        }
                    }
                }) ;
        };

        $scope.$on('$routeUpdate', function(){
            $scope.pid = $location.search().pid;
            $scope.getReplies($scope.pid);
        });

        $scope.getReplies = function(postId){
            var i = _.findIndex($scope.topics, { 'discussion': {'_id' : postId}});
            $scope.currentTopic = $scope.topics[i].discussion;

            $http.get('/api/discussions/' + postId + '/posts').success(function(res){
                if(res.result){
                    $scope.replies = res.posts;
                }
            });
        }

    });