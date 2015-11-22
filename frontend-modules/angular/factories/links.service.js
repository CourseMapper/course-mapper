app.factory('linkService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            posts: null,

            init: function (nodeId, success, error, force) {
                var self = this;

                if (!force && self.posts) {
                    if (success)
                        success(self.posts);
                }

                else if (force || !self.posts)
                    $http.get('/api/links/' + nodeId)
                        .success(function(data){
                            if(data.result && data.posts){
                                self.posts = data.posts;
                                if (success)
                                    success(self.posts);
                            }
                        })
                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
            },


            isInitialized: function () {
                if (!this.posts) {
                    return false;
                }

                return true;
            }
        }
    }
]);