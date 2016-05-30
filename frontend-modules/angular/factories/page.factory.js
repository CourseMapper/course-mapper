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
        },

        xs: 768,
        sm: 992,
        md: 1200,

        defineDevSize: function(width){
            if(width < this.xs){
                return 'xs';
            } else if(width > this.xs && width <= this.sm){
                return 'sm';
            } else if(width > this.sm && width <= this.md){
                return 'md';
            } else if(width > this.md){
                return 'lg';
            }
        }
    };
});