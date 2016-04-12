app
    .directive('dynamicController', ['$controller', function ($controller) {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, element, attrs) {

                var locals = {
                    $scope: scope,
                    $element: element,
                    $attrs: attrs
                };

                var kol = scope.$eval(attrs.dynamicController);
                if (kol)
                    element.data('$Controller', $controller(kol, locals));
            }
        };
    }
    ]);