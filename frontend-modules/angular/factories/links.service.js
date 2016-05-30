app.factory('linkService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            posts: null,
            nodeId: null,

            pageParams: {
                limit: 10,
                sortBy: 'dateAdded',
                orderBy: -1,
                lastPage: false
            },

            getMoreRows: function (success, error) {
                var self = this;

                self.setPageUrl();
                $http.get('/api/links/' + self.nodeId + self.pageUrl)
                    .success(function (data) {
                        if (data.result && data.posts && data.posts.length > 0) {
                            self.posts = self.posts.concat(data.posts);

                            if (success)
                                success(data.posts, self.posts);
                        }
                        else
                            success(false);
                    })
                    .error(function (data) {
                        if (error)
                            error(data.errors);
                    });
            },

            setPageUrl: function () {
                this.pageUrl = '?';

                var ps = [];
                for (var k in this.pageParams) {
                    ps.push(k + '=' + this.pageParams[k]);
                }

                this.pageUrl += ps.join('&');
            },

            setPageParams: function (scp) {
                var self = this;

                self.pageParams.limit = scp.limit;
                self.pageParams.sortBy = scp.sortBy;
                self.pageParams.orderBy = scp.orderBy;
                self.pageParams.lastPage = scp.lastPage;
            },

            init: function (nodeId, success, error, force) {
                var self = this;

                self.nodeId = nodeId;

                if (!force && self.posts) {
                    if (success)
                        success(self.posts);
                }

                else if (force || !self.posts) {
                    self.setPageUrl();
                    $http.get('/api/links/' + nodeId + self.pageUrl)
                        .success(function (data) {
                            if (data.result && data.posts) {
                                self.posts = data.posts;
                                if (success)
                                    success(self.posts);
                            }
                        })
                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
                }
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