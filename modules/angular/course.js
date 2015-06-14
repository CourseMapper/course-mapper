app.controller('CourseController', function($scope, $filter, $http, $location) {
    $scope.course = null;

    $scope.currentUrl = window.location.href;
    $scope.followUrl = $scope.currentUrl + '?follow=1';
});


app.controller('CourseListController', function($scope, $rootScope, $http, $routeParams, $location) {
    $scope.slug = $routeParams.slug;

    $http.get('/api/category/' + $scope.slug + '/courses').success(function(data) {
        $scope.courses = data.courses;
    });

    $http.get('/api/category/' + $scope.slug + '/courseTags').success(function(data) {
        $scope.courseTags = data.courseTags;
    });

});

app.controller('NewCourseController', function($scope, $filter, $http, $location) {
    $scope.course = {
        course: null,
        category: null,
        description: '',
        _id: null
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

    $scope.loadCategories();

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
                console.log(data);
                if(data.result) {
                    // if successful, bind success data.course to course
                    $scope.courseModel = data.course;
                    $scope.course.shortId = data.course.shortId;
                    $scope.saved = true;

                    $scope.$emit('onAfterCreateNewCourse');

                    window.location.href = '/course/' + $scope.course.shortId + '?new=1';
                }
            })
            .error(function(data){
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
    });*/

    $scope.initAutoGrow = function(){
        if(jQuery().autoGrowInput) {
            jQuery('#courseTitle input[type=text]').autoGrowInput({ minWidth: 200, maxWidth: 600, comfortZone: 10 });
        }
    }
});

