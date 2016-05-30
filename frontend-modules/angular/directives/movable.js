/*jslint node: true */
'use strict';

app.directive('movable', function () {
  var getRelativePosition = function (position, parent) {
    return {
      left: Math.round((100 * position.left / parent.clientWidth)),
      top: Math.round((100 * position.top / parent.clientHeight))
    };
  };

  var getRelativeSize = function (size, parent) {
    return {
      width: Math.round((100 * size.width / parent.clientWidth)),
      height: Math.round((100 * size.height / parent.clientHeight))
    };
  };

  return {
    restrict: 'A',
    scope: {
      onMoved: '=',
      canMove: '@'
    },
    link: function (scope, element, attrs) {
      attrs.$observe('canMove', function (value) {
        if (value === 'false') {
          element
            .draggable({disabled: true})
            .resizable({disabled: true});
        } else {
          element
            .draggable({disabled: false})
            .resizable({disabled: false});
        }
      });

      element
        .draggable({
          containment: 'parent',
          cursor: 'move',
          stop: function (event, ui) {
            if (scope.onMoved) {
              scope.onMoved({
                position: getRelativePosition(ui.position, element.parent()[0])
              });
            }
          }
        })
        .resizable({
          containment: 'parent',
          handles: 'ne, se, sw, nw',
          stop: function (event, ui) {
            if (scope.onMoved) {
              var parent = element.parent()[0];
              scope.onMoved({
                position: getRelativePosition(ui.position, parent),
                size: getRelativeSize(ui.size, parent)
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
