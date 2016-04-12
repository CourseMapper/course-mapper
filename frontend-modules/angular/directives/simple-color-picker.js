app.directive('simplecolorpicker', function() {
  return {
    restrict: 'A',
    require: 'ngModel',

    link: function(scope, element, attrs, ngModel) {
      var colorPicker = null;
      var initialSelectedColor = null;

      function selectColor(color) {
        initialSelectedColor = null;
        element.val(color);
        element.simplecolorpicker('selectColor', element.val());
      }

      // HACK Wait for the AngularJS expressions inside element to be compiled
      setTimeout(function() {
        colorPicker = element.simplecolorpicker();
        if (initialSelectedColor !== null) {
          // Initializes the colorpicker with a color if one exists
          selectColor(initialSelectedColor);
        }

        // View -> model
        colorPicker.on('change', function() {
          scope.$apply(function() {
            ngModel.$setViewValue(element.val());
          });
        });
      }, 0); // Works with no delay

      // Model -> view
      ngModel.$render = function() {
        if (colorPicker !== null) {
          selectColor(ngModel.$viewValue);
        } else {
          initialSelectedColor = ngModel.$viewValue;
        }
      };

      // Cleanup
      element.on('$destroy', function() {
        if (colorPicker !== null) {
          element.simplecolorpicker('destroy');
        }
      });

    }
  };
});
