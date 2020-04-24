angular.module('MyCreatedCourses', [''])
    /*.filter('unique', function () {

        return function (items, filterOn) {

            if (filterOn === false) {
                return items;
            }

            if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
                var hashCheck = {}, newItems = [];

                var extractValueToCompare = function (item) {
                    if (angular.isObject(item) && angular.isString(filterOn)) {
                        return item[filterOn];
                    } else {
                        return item;
                    }
                };

                angular.forEach(items, function (item) {
                    var valueToCheck, isDuplicate = false;

                    for (var i = 0; i < newItems.length; i++) {
                        if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate) {
                        newItems.push(item);
                    }

                });
                items = newItems;
            }
            return items;
        };
    })*/
    .controller('CourseListCreatedController', function($scope, $http) {
        $scope.headerTitle = "Course Name";
        $http.get('/api/my-course').success(function (data) {
            $scope.courseCreated = data.courses.created;
            $scope.courseCreatedLength = data.courses.created.length;
        });

        $http.get('/api/my-course/created-resources').success(function (data) {
            $scope.courseCreatedResources = data.resources;
        });

        /*$http.get('/api/my-course/newsfeed').success(function (data) {
            $scope.newsfeedData  = data.newsfeed;
        });*/

        $http.get('/api/my-course/my-node-activity-status').success(function (data) {
            $scope.myNodeActivity  = data.myNodeActivityStatus;
        });

        $http.get('/api/my-course/my-discussion-status').success(function (data) {
            $scope.myDiscussionStatus  = data.myDiscussionStatus;
        });

        //filtering scope newsfeed
        $scope.isPdfAnno = function (action) {
            return action.type == 'pdf annotation';
        };
        $scope.isVideoAnno = function (action) {
            return action.type == 'video annotation';
        };
        $scope.isDiscussion = function (action) {
            return action.type == 'discussion';
        };
        $scope.isLink = function (action) {
            return action.type == 'link';
        };
        $scope.isExtResource = function (action) {
            return action.type == 'ext-resource';
        };
        $scope.isAdded = function (action) {
            return action.actionType == 'added';
        };
        $scope.isThisDeleted = function (action) {
            return action.actionType == 'deleted';
        };
        $scope.isTrue = function (action) {
            return action.isDeleted == false;
        };

        //filtering scope resources
        $scope.isPdf = function (action) {
            return action.type == 'pdf';
        };
        $scope.isVideo = function (action) {
            return action.type != 'pdf';
        };
    });