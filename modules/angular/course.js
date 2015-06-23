app.controller('CourseController', function($scope, $filter, $http, $location, $routeParams) {
    $scope.course = null;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?enroll=1';

    $scope.params = $routeParams;
});

app.controller('CourseListController', function($scope, $rootScope, $http, $routeParams, $location) {
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

    $scope.getCoursesFromThisCategory = function(){
        var url = '/api/category/' + $scope.category._id + '/courses';
        var t = [];
        if($scope.filterTags.length > 0) {
            for (var i in $scope.filterTags)
                t.push($scope.filterTags[i]._id);

            url += '?tags=' + t.join(',');
        }

        $http.get(url).success(function(data) {
            $scope.courses = data.courses;
        });
    };

    $scope.initTagFromSearch = function(){
        var tagSearch = $location.search();
        if(tagSearch && tagSearch.tags){
            var tags = tagSearch.tags.split(',');
            if(tags)
            for(var i in tags){
                var tag = tags[i];
                if($scope.availableTags)
                for(var j in $scope.availableTags) {
                    var t = $scope.availableTags[j];
                    if (t.slug == tag)
                        $scope.applyFilter(t, true);
                }
            }
        }

        $scope.getCoursesFromThisCategory();

        $scope.$watch(function(){ return $location.search() }, function(){
            $scope.getCoursesFromThisCategory();
        }, true);
    };

    $scope.applyFilter = function(tag, dontgo){
        if(arrayObjectIndexOf($scope.filterTags, tag, 'name') < 0){
            $scope.filterTags.push(tag);
            $scope.filterTagsText.push(tag.slug);
            removeObjectFromArray($scope.availableTags, tag, 'name');
            if(!dontgo)
                $scope.go();
        }
    };

    $scope.go = function(){
        if($scope.filterTags.length > 0)
            $location.search({tags: $scope.filterTagsText.join(',')} );
        else
            $location.search({});
    };

    $scope.removeFilter = function(tag){
        if(arrayObjectIndexOf($scope.availableTags, tag, 'name') < 0){
            $scope.availableTags.push(tag);
            removeObjectFromArray($scope.filterTags, tag, 'name');

            for (var i=$scope.filterTagsText.length-1; i>=0; i--) {
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
    $http.get('/api/category/' + $scope.slug ).success(function(data) {
        $scope.category = data.category;

        // once we get the complete category structure, we operate by id
        $http.get('/api/category/' + $scope.category._id + '/courseTags').success(function(data) {
            $scope.courseTags = data.courseTags;
            $scope.availableTags = data.courseTags;

            $scope.initTagFromSearch();
        });
    });
});

app.controller('NewCourseController', function($scope, $filter, $http, $location) {
    $scope.course = {
        name: null,
        category: null,
        description: ''
    };

    $scope.createdDate = new Date();

    $scope.saved = false;
    $scope.categories = [];

    /*$scope.def = {
        course: 'Untitled course',
        description: 'This should be a text that explains generally about this course',
        category: 'Please pick a category'
    }; */

    $scope.loadTags = function(query) {
        return $http.get('/api/category/' + $scope.category._id + '/courseTags?query=' + query);
    };

    $scope.saveCourse = function() {
        if($scope.course.tags) {
            $scope.course.tags = JSON.stringify($scope.course.tags);
        }

        var d = transformRequest($scope.course);
        $http({
            method: 'POST',
            url: '/api/courses',
            data: d,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
            .success(function(data) {
                $scope.course = {};
                console.log(data);
                if(data.result) {
                    // if successful, bind success data.course to course
                    /*$scope.courseModel = data.course;
                    $scope.course.shortId = data.course.shortId;
                    $scope.saved = true;*/

                    $scope.$emit('onAfterCreateNewCourse');

                    window.location.href = '/course/' + data.course.shortId + '?new=1';
                }
            })
            .error(function(data){
                $scope.course.tags = JSON.parse($scope.course.tags);
                if( data.result != null && !data.result){
                    $scope.errorName = data.errors.name;
                    console.log(data.errors);
                }
            });
    };
});

