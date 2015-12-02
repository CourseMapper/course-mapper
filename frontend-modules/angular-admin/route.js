admin.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
        when('/categories', {
            templateUrl: '/cm-admin/categories',
            controller: 'adminController',
            resolve: {
                pd: function ($q) {
                    return ( {
                        title: 'Manage Categories',
                        breads: [
                            {a: '', active: true, title: 'Categories'}
                        ]
                    } );
                }
            }
        }).

        when('/categories/:category', {
            templateUrl: '/cm-admin/category',
            controller: 'adminController',
            resolve: {
                pd: function ($q) {
                    return ( {
                        title: 'Manage Category',
                        breads: [
                            {a: '#/categories', active: false, title: 'Categories'}
                        ]
                    });
                }
            }
        }).

        when('/widgets', {
            templateUrl: '/cm-admin/applications',
            controller: 'applicationsController',
            resolve: {
                pd: function ($q) {
                    return ( {
                        title: 'Manage Widgets',
                        breads: [
                            {a: '#/widgets', active: false, title: 'Widgets'}
                        ]
                    });
                }
            }
        }).

        when('/tabs', {
            templateUrl: '/cm-admin/tabs',
            controller: 'tabsController',
            resolve: {
                pd: function ($q) {
                    return ( {
                        title: 'Manage Tabs',
                        breads: [
                            {a: '#/tabs', active: false, title: 'Tabs'}
                        ]
                    });
                }
            }
        }).

        when('/cm-admin', {
            templateUrl: '/cm-admin-html.tpl',
            controller: 'adminHomeController',
            resolve: {
                pd: function ($q) {
                    return ( {
                        title: 'Admin Home',
                        breads: [
                            {a: '#/home', active: false, title: 'Home'}
                        ]
                    });
                }
            }
        }).

        otherwise({
            redirectTo: '/cm-admin'
        });
    }]);


