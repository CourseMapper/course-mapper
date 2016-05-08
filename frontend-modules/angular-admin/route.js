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
                        title: 'Manage Widgets and Background Plugins',
                        breads: [
                            {a: '#/widgets', active: false, title: 'Widgets and Background Plugins'}
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

        when('/adminusers', {
            templateUrl: '/cm-admin/adminusers',
            controller: 'AdminUserController',
            resolve: {
                pd: function ($q) {
                    return ( {
                        title: 'Manage Admin Users',
                        breads: [
                            {a: '#/adminusers', active: false, title: 'Admin Users'}
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

        when('/category-recommendations', {
            templateUrl: '/cm-admin/category-recommendations',
            controller: 'CategoryRecommendationsController',
            resolve: {
                pd: function ($q) {
                    return ( {
                        title: 'Category Recommendations',
                        breads: [
                            {a: '#/home', active: false, title: 'category recommendations'}
                        ]
                    });
                }
            }
        }).

        otherwise({
            redirectTo: '/cm-admin'
        });
    }]);


