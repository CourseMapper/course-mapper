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
                    console.log('Disabling draggable and resizable');
                    element.draggable({
                        disabled: true
                    }).resizable({
                        disabled: true
                    });
                } else {
                    console.log('Enabling draggable and resizable');
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
                console.log(position);
                return position;
            };
            console.log('Initializing draggable and resizable');
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
                        if (scope.onMoved) {
                            scope.onMoved({
                                position: getPosition(ui),
                                size: ui.size
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
