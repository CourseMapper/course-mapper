app.factory('Page', function($window) {
    var prefix = 'CourseMapper';
    var title = 'CourseMapper';
    return {
        title: function() {
            return title;
        },

        setTitle: function(newTitle) {
            title = newTitle;
            $window.document.title = title;
        },

        setTitleWithPrefix: function(newTitle) {
            title = prefix + ': ' + newTitle;
            $window.document.title = title;
        }
    };
});