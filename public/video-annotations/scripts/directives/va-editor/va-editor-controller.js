videoAnnotationsModule.controller('VaEditorController', ['$scope', 'socket',
    function($scope, socket) {

        $scope.annotationTypes = [{
            id: 'embedded-note',
            name: 'Embedded Note'
        }, {
            id: 'note',
            name: 'Note'
        }];

        $scope.saveAnnotation = function() {
            var annotation = $scope.annotation;
            var params = {
                annotation: annotation
            };
            socket.emit('annotations:save', params);
            $scope.annotation = null;
        };

        $scope.cancelEdit = function() {
            $scope.annotation = null;
        };

        $scope.deleteAnnotation = function() {
            var params = {
                id: $scope.annotation._id
            };
            socket.emit('annotations:delete', params);
            $scope.annotation = null;
        };
    }
]);
