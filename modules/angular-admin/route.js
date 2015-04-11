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
                                {a: '', active:true, title: 'Categories'}
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
                                {a: '#/categories', active:false, title: 'Categories'},
                                {a: '', active:true, title: 'Category: '}
                            ]
                        });
                    }
                }
            }).
            otherwise({
                redirectTo: '/cm-admin'
            });
    }]);


