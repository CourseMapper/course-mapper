app.
    controller('ReplyController', function($scope, $http, $timeout) {
        $scope.formData = {
            title: " ",
            content: ""
        };

        $scope.formNewData = {
            title: " ",
            content: ""
        };

        $scope.menu = [
            ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
            [ 'font-size' ],
            ['ordered-list', 'unordered-list', 'outdent', 'indent'],
            ['left-justify', 'center-justify', 'right-justify'],
            ['code', 'quote', 'paragraph']
        ];

        $scope.$on('onEditReplyClicked', function(e, post){
            $scope.formData.content = post.content;
            $scope.formData.postId = post._id;
        });

        $scope.saveNewReply = function(){
            console.log('saving reply to ' + $scope.$parent.currentReplyingTo);
            $scope.formNewData.parentPost = $scope.$parent.currentReplyingTo;

            var d = transformRequest($scope.formNewData);
            $http({
                method: 'POST',
                url: '/api/discussion/replies/',
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function(data) {
                    console.log(data);
                    if(data.result) {
                        $scope.$emit('onAfterCreateReply', data.post);

                        $('#addNewReplyModal').modal('hide');

                        $scope.formNewData.content = "";

                        $timeout(function(){$scope.$apply()});
                    } else {
                        if( data.result != null && !data.result){
                            $scope.errorName = data.errors;
                            console.log(data.errors);
                        }
                    }
                }) ;
        };

        $scope.cancel = function(){
            $scope.formData.content = "";
            $scope.formNewData.content = "";

            $timeout(function(){$scope.$apply()});
        };

        $scope.saveEditReply = function(){
            console.log('saving edit reply ' + $scope.$parent.currentEditPost._id);

            var d = transformRequest($scope.formData);
            $http({
                method: 'PUT',
                url: '/api/discussion/' + $scope.$parent.currentEditPost._id,
                data: d,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
                .success(function(data) {
                    console.log(data);
                    if(data.result) {
                        $scope.$emit('onAfterEditReply', data.post);

                        $scope.formData.content = "";
                        $timeout(function(){$scope.$apply()});

                        $('#editReplyModal').modal('hide');
                    } else {
                        if( data.result != null && !data.result){
                            $scope.errorName = data.errors;
                            console.log(data.errors);
                        }
                    }
                }) ;
        };

        /**
         * deleting root topic
         * @param postId
         */
        $scope.deletePost = function(postId){
            $http({
                method: 'DELETE',
                url: '/api/discussion/' + postId,
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

    });