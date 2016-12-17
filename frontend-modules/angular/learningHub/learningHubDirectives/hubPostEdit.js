
learningHubModule.directive('hubPostEdit', function() {
        return {
            restrict: 'E',
            templateUrl: './templates/HubLink/hubPostEdit.html',
            scope: {
                post: '='
            }
        }
    });
