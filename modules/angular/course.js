
app.controller('CourseListController', function($scope, $http, $rootScope) {
    $http.get('/api/catalogs/courses').success(function(data) {
        $scope.courses = data;
    });
});

app.controller('NewCourseController', function($scope, $filter, $http, $location) {
    $scope.course = {
        name: '',
        category: '',
        startedDate: new Date()
    };

    $scope.saved = false;
    $scope.categories = [];
    $scope.newCode = '';

    $scope.def = {
        name: 'Untitled course',
        description: 'This should be a text that explains generally about this course',
        category: 'Please pick a category'
    };

    $scope.loadCategories = function() {

        return $scope.categories.length ? null : $http.get('/api/catalogs/categories').success(
            function(data) {
                $scope.categories = data.categories;
            });
    };

    $scope.date = new Date();

    $scope.$watch('course.category', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            var selected = $filter('filter')($scope.categories, {slug: $scope.course.category});
            $scope.course.slug = selected.length ? selected[0].text : null;
        }
    });

    $scope.$watch('course', function(newVal, oldVal){
        // check if the creator has added a course or category/ and not just a default value
        if(
            newVal.name != '' && newVal.name !== $scope.def.name &&
            newVal.category != '' && newVal.category !== $scope.def.category
        ){
            console.log('saving');
            $scope.saved = true;

            $scope.newCode = '2akcoieuQ';
        }
    }, true);

    $scope.$watch('newCode', function(newVal, oldVal){
        if($scope.newCode != ''){
            $location.path('/catalog/course/' + $scope.newCode);
            $location.replace();
        }
    });

    $scope.initAutoGrow = function(){
        if(jQuery().autoGrowInput) {
            jQuery('#courseTitle input[type=text]').autoGrowInput({ minWidth: 200, maxWidth: 600, comfortZone: 10 });
        }
    }
});