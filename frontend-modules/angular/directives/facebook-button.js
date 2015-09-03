app.directive('facebookButton',
    function () {
        return {
            restrict: 'E',
            terminal: true,
            template:
                '<div class="control-group">' +
                    '<a href="/api/accounts/login/facebook">' +
                    '<img src="/admin-lte/images/fb.png">' +
                    '</a>' +
                '</div>'
    };
});