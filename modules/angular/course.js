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
        var url = '/api/category/' + $scope.slug + '/courses';
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

    $http.get('/api/category/' + $scope.slug ).success(function(data) {
        $scope.category = data.category;
    });

    $http.get('/api/category/' + $scope.slug + '/courseTags').success(function(data) {
        $scope.courseTags = data.courseTags;
        $scope.availableTags = data.courseTags;

        $scope.initTagFromSearch();
    });

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

    $scope.def = {
        course: 'Untitled course',
        description: 'This should be a text that explains generally about this course',
        category: 'Please pick a category'
    };

    $scope.loadCategories = function() {
        return $scope.categories.length ? null : $http.get('/api/categories').success(
            function(data) {
                $scope.categories = data.categories;
            });
    };

    //$scope.loadCategories();
    $scope.loadTags = function(query) {
        return $http.get('/api/category/' + $scope.category.slug + '/courseTags?query=' + query);
    };

    $scope.$watch('course.category', function(newVal, oldVal) {
        console.log(newVal);
        if (newVal !== oldVal) {
            var selected = $filter('filter')($scope.categories, {slug: $scope.course.category});
            $scope.course.category = selected.length ? selected[0].slug : null;
        }
    });

    /**
     * check if the creator has added a course or category/ and not just a default value
     * this is an initial saving to create a new course record in DB

    $scope.$watch('course', function(newVal, oldVal){
        if(
            newVal.course && newVal.course !== $scope.def.course &&
            newVal.category && newVal.category !== $scope.def.category
        ){
            $scope.saveCourse();
        }
    }, true);*/

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

    /**
     * this watch is for an create new course use case.
     * we disable all tabs except 1st one, and enable it once we obtained course._id from server

    $scope.$watch('course._id', function(newVal, oldVal){
        if($scope.course._id && $scope.saved){
            $location.path('/course/' + $scope.course._id);
            $location.replace();

            // enable all tabs
            //$('#courseNavigationTabs ul li').removeClass('disabled');
            //var a = $('#courseNavigationTabs ul li a');
            //a.attr('data-toggle', 'tab');
            //a.attr('href', a.attr('data-href'));
        }
    });

    $scope.initAutoGrow = function(){
        if(jQuery().autoGrowInput) {
            jQuery('#courseTitle input[type=text]').autoGrowInput({ minWidth: 200, maxWidth: 600, comfortZone: 10 });
        }
    }*/
});

