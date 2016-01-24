app.factory('discussionService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            posts: null,
            pageUrl: '',
            courseId: null,

            pageParams: {
                limit: 10,
                sortBy: 'dateAdded',
                orderBy: -1,
                lastPage: false
            },

            init: function (courseId, success, error, force) {
                var self = this;

                self.courseId = courseId;
                self.setPageUrl();

                if (!force && self.posts) {
                    if (success)
                        success(self.posts);
                }

                else if (force || !self.posts)
                    $http.get('/api/discussions/' + courseId + self.pageUrl)
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
            },

            getMoreRows: function (success, error) {
                var self = this;

                self.setPageUrl();
                $http.get('/api/discussions/' + self.courseId + self.pageUrl)
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

            isInitialized: function () {
                if (!this.posts) {
                    return false;
                }

                return true;
            }
        }
    }
]);