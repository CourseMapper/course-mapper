/*
 takenfrom:http://blog.brunoscopelliti.com/
 */
app.directive('pwCheck', [function () {
    return {
        require: "ngModel",
        scope: {
            original: "="
        },
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.pwCheck;

            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    var v = elem.val()===$(firstPassword).val();
                    ctrl.$setValidity('pwmatch', v);
                });
            });
        }
    };
}]);