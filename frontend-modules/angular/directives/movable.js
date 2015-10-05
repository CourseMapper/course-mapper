/*jslint node: true */
'use strict';

app.directive('movable', function () {
    return {
        restrict: 'A',
        scope: {
            onMoved: '=',
            canMove: '@'
        },
        link: function (scope, element, attrs) {
            attrs.$observe('canMove', function (value) {
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

            var getPosition = function (ui) {
                var position = {
                    left: Math.round((100 * ui.position.left / element.parent()[0].clientWidth)),
                    top: Math.round((100 * ui.position.top / element.parent()[0].clientHeight))
                };
                return position;
            };
            element
                .draggable({
                    containment: 'parent',
                    cursor: 'move',
                    stop: function (event, ui) {
                        if (scope.onMoved) {
                            scope.onMoved({
                                position: getPosition(ui)
                            });
                        }
                    }
                })
                .resizable({
                    containment: 'parent',
                    handles: 'ne, se, sw, nw',
                    stop: function (event, ui) {
                        // get relative size to the container element
                        var size = {};
                        size.width = Math.round((100 * ui.size.width / element.parent()[0].clientWidth));
                        size.height = Math.round((100 * ui.size.height / element.parent()[0].clientHeight));

                        if (scope.onMoved) {
                            scope.onMoved({
                                position: getPosition(ui),
                                size: size
                            });
                        }
                    }
                });

            // remove event handlers
            scope.$on('$destroy', function () {
                element.off('**');
            });
        }
    };
});
