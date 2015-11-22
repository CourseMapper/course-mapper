app.factory('treeNodeService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            treeNode: null,
            pdfFile: null,
            videoFile: null,

            init: function (nodeId, success, error, force) {
                var self = this;

                if (!force && self.treeNode) {
                    if (success)
                        success(self.treeNode);
                }
                else if (force || !self.treeNode) {
                    $http.get('/api/treeNode/' + nodeId)
                        .success(function (res) {
                            if (res.result) {
                                self.treeNode = res.treeNode;
                                self.parseResources();

                                if (success)
                                    success(res.treeNode);
                            }
                        })
                        .error(function (res) {
                            if (error)
                                error(res);
                        });
                }
            },

            parseResources: function () {
                var self = this;
                for (var i = 0; i < self.treeNode.resources.length; i++) {
                    var content = self.treeNode.resources[i];
                    if (content['type'] == 'mp4'
                        || content['type'] == 'video'
                        || content['type'] == 'videoLink'
                    ) {
                        self.videoFile = content;
                        self.treeNode.videoFile = content;
                    } else if (content['type'] == 'pdf'
                        || content['type'] == 'pdfLink'
                    ) {
                        self.pdfFile = content;
                        self.treeNode.pdfFile = content;
                    }
                }
            },

            isOwner: function (user) {
                var self = this;

                if (!user) {
                    return false;
                }

                if (!self.isInitialized()) return false;

                return (user._id == self.treeNode.createdBy._id);
            },

            isInitialized: function () {
                if (!this.treeNode) {
                    return false;
                }

                return true;
            }
        }
    }
]);