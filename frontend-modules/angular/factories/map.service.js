app.factory('mapService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            treeNodes: null,

            init: function (courseId, success, error, force) {
                var self = this;

                if (!force && self.treeNodes) {
                    if (success)
                        success(self.treeNodes);
                }

                else if (force || !self.treeNodes)
                    $http.get('/api/treeNodes/course/' + courseId)
                        .success(function (data) {
                            if (data.result) {
                                self.treeNodes = data.treeNodes;
                                if (success)
                                    success(self.treeNodes);
                            }
                        })

                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
            },


            isInitialized: function () {
                if (!this.treeNodes) {
                    return false;
                }

                return true;
            }
        }
    }
]);