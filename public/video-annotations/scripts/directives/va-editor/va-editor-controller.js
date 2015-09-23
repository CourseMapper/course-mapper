/*jslint node: true */
'use strict';

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
    }
]);
