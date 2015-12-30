app.controller('CourseListController', function ($scope, $rootScope, $http,
                                                 $routeParams, $location, $sce,
                                                 Page, courseListService) {
    $scope.slug = $routeParams.slug;

    // chosen filter
    $scope.filterTags = [];
    $scope.filterTagsText = [];
    // this will be displayed on the available filter
    $scope.availableTags = [];
    // the original list
    $scope.courseTags = [];
    $scope.category = null;
    $scope.courses = null;
    $scope.coursesLength = 0;

    $scope.widgets = [];

    $scope.getCoursesFromThisCategory = function () {
        courseListService.init($scope.category._id, $scope.filterTags,
            function (courses) {
                $scope.courses = courses;
                $scope.coursesLength = courses.length;
            },
            function (errors) {
                console.log(JSON.stringify(errors));
            }
        );
    };

    $scope.newRowsFetched = function (newRows, allRows) {
        if (newRows) {
            $scope.courses = allRows;
            $scope.coursesLength = $scope.courses.length;
        }
    };

    $scope.initTagFromSearch = function () {
        var tagSearch = $location.search();
        if (tagSearch && tagSearch.tags) {
            var tags = tagSearch.tags.split(',');
            if (tags)
                for (var i in tags) {
                    var tag = tags[i];
                    if ($scope.availableTags)
                        for (var j in $scope.availableTags) {
                            var t = $scope.availableTags[j];
                            if (t.slug == tag)
                                $scope.applyFilter(t, true);
                        }
                }
        }

        $scope.getCoursesFromThisCategory();

        $scope.$watch(function () {
            return $location.search()
        }, function (newVal, oldVal) {
            if (newVal && newVal !== oldVal)
                $scope.getCoursesFromThisCategory();
        }, true);
    };

    $scope.getCourseAnalytics = function (cid) {
        $http.get('/api/server-widgets/course-listing/?cid=' + cid).success(
            function (res) {
                if (res.result) {
                    $scope.widgets[cid] = $sce.trustAsHtml(res.widgets);
                }
            }
        ).error(function () {

        });
    };

    $scope.applyFilter = function (tag, dontgo) {
        if (arrayObjectIndexOf($scope.filterTags, tag, 'name') < 0) {
            $scope.filterTags.push(tag);
            $scope.filterTagsText.push(tag.slug);
            removeObjectFromArray($scope.availableTags, tag, 'name');
            if (!dontgo)
                $scope.go();
        }
    };

    $scope.go = function () {
        if ($scope.filterTags.length > 0)
            $location.search({tags: $scope.filterTagsText.join(',')});
        else
            $location.search({});
    };

    $scope.removeFilter = function (tag) {
        if (arrayObjectIndexOf($scope.availableTags, tag, 'name') < 0) {
            $scope.availableTags.push(tag);
            removeObjectFromArray($scope.filterTags, tag, 'name');

            for (var i = $scope.filterTagsText.length - 1; i >= 0; i--) {
                if ($scope.filterTagsText[i] === tag.slug) {
                    $scope.filterTagsText.splice(i, 1);
                    break;
                }
            }
            $scope.go();
        }
    };

    /**
     * init category data by slug
     */
    $http.get('/api/category/' + $scope.slug).success(function (data) {
        $scope.category = data.category;

        Page.setTitleWithPrefix($scope.category.name);

        // once we get the complete category structure, we operate by id
        $http.get('/api/category/' + $scope.category._id + '/courseTags').success(function (data) {
            $scope.courseTags = data.courseTags;
            $scope.availableTags = data.courseTags;

            $scope.initTagFromSearch();
        });
    });
});
