/*jslint node: true */
'use strict';

app.directive('movablePdf', function() {
    var getRelativePosition = function(position, parent) {
        return {
            left: 1.0 * position.left / $("#annotationZone").width(),
            top: 1.0 * position.top / $("#annotationZone").height()
        };
    };

    var getRelativeSize = function(size, parent) {
        return {
            width: 1.0 * size.width / $("#annotationZone").width(),
            height: 1.0 * size.height / $("#annotationZone").height()
        };
    };

      return {
        restrict: 'A',
        scope: {
            onMoved: '=',
            canMove: '@'
        },
        link: function(scope, element, attrs) {
            attrs.$observe('canMove', function(value) {
                if (value === 'false') {
                    element.draggable({
                        disabled: true
                    }).resizable({
                        disabled: true
                    });
                } else {
                    element.draggable({
                        disabled: false
                    }).resizable({
                        disabled: false
                    });
                }
            });

            element
                .draggable({
                    containment: $("#annotationZone"),
                    cursor: 'move',
                    stop: function(event, ui) {
                        if (scope.onMoved) {
                            scope.onMoved({
                                position: getRelativePosition(ui.position, $("#annotationZone"))
                            });
                        }
                    }
                })
                .resizable({
                    containment: $("#annotationZone"),
                    handles: 'ne, se, sw, nw',
                    stop: function(event, ui) {
                        if (scope.onMoved) {
                            var parent = $("#annotationZone");
                            
                            scope.onMoved({
                                position: getRelativePosition(ui.position, parent),
                                size: getRelativeSize(ui.size, parent)
                            });
                        }
                    }
                });

            // remove event handlers
            scope.$on('$destroy', function() {
                element.off('**');
            });
        }
    };
});
