app.factory('courseListService', [
    '$rootScope', '$http',

    function ($rootScope, $http) {
        return {
            courses: null,
            pageUrl: '',

            pageParams: {
                limit: 12,
                sortBy: '_id',
                orderBy: 'desc',
                lastPage: false
            },

            init: function (categoryId, filterTags, success, error, force) {
                var self = this;

                self.categoryId = categoryId;
                self.setPageUrl();

                if (!force && self.courses) {
                    if (success)
                        success(self.courses);
                }

                else if (force || !self.courses) {
                    var url = '/api/category/' + categoryId + '/courses';
                    var t = [];
                    if (filterTags.length > 0) {
                        for (var i in filterTags)
                            t.push(filterTags[i]._id);

                        url += '?tags=' + t.join(',');
                    }

                    $http.get(url)
                        .success(function (data) {
                            self.courses = data.courses;
                            success(data.courses)
                        })
                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
                }
            },

            getMoreRows: function (success, error) {
                var self = this;

                self.setPageUrl();
                $http.get('/api/category/' + self.categoryId + '/courses' + self.pageUrl)
                    .success(function (data) {
                        if (data.result && data.courses && data.courses.length > 0) {
                            self.courses = self.courses.concat(data.courses);

                            if (success)
                                success(data.courses, self.courses);
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
                if (!this.courses) {
                    return false;
                }

                return true;
            }
        }
    }
]);