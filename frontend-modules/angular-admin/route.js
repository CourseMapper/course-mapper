admin.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/categories', {
                templateUrl: '/cm-admin/categories',
                controller: 'adminController',
                resolve: {
                    pd: function( $q ) {
                        return( {
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
                    pd: function( $q ) {
                        return( {
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
                    pd: function( $q ) {
                        return( {
                            title: 'Manage Widgets',
                            breads: [
                                {a: '#/widgets', active: false, title: 'Widgets'}
                            ]
                        });
                    }
                }
            }).

            /*when('/application/:appName', {
                templateUrl: '/cm-admin/application',
                controller: 'applicationController',
                resolve: {
                    pd: function( $q ) {
                        return( {
                            title: 'Manage Applications',
                            breads: [
                                {a: '#/applications', active: false, title: 'Applications'}
                            ]
                        });
                    }
                }
            }).*/

            otherwise({
                redirectTo: '/cm-admin'
            });
    }]);


