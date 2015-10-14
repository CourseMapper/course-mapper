app.factory('Page', function() {
    var prefix = 'CourseMapper';
    var title = 'CourseMapper';
    return {
        title: function() { return title; },
        setTitle: function(newTitle) { title = newTitle },
        setTitleWithPrefix: function(newTitle) { title = prefix + ': ' + newTitle }
    };
});