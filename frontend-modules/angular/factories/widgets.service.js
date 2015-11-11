app.factory('widgetService', [
    '$http', '$rootScope', '$ocLazyLoad', '$timeout',

    function (  $http, $rootScope, $ocLazyLoad, $timeout) {
        return {
            widgets: [],
            uninstalledwidgets: [],
            installedWidgets: [],

            getWidgetsOnLocation: function (location, id, success, error, force) {
                var self = this;

                if (!force && self.installedWidgets[location]) {
                    self.initializeWidgets(self.installedWidgets[location], location, function( ){
                        if (success) {
                            success(self.widgets[location]);
                        }
                    });
                }

                else if (force || !self.widgets[location])
                    $http.get('/api/widgets/' + location + '/' + id)
                        .success(function (data) {
                            self.installedWidgets[location] = [];

                            if(data.result){
                                self.installedWidgets[location] = data.widgets;

                                self.initializeWidgets(data.widgets, location, function( ){
                                    if (success) {
                                        success(self.widgets[location]);
                                    }
                                });
                            } else
                                if (error)
                                    error(data.errors);
                        })
                        .error(function (data) {
                            if (error)
                                error(data.errors);
                        });
            },

            lazyLoad: function (wdg, currentIndex, widgetJsArray, fileToLoad, location) {
                var self = this;

                (function (wdg) {
                    var jsfn = '/' + wdg.application + '/' + fileToLoad;

                    $ocLazyLoad.load(jsfn).then(function () {
                        // the last one has been loaded
                        var l = wdg.widgetId.widgetJavascript.length - 1;
                        if (fileToLoad == wdg.widgetId.widgetJavascript[l]) {
                            // only push to main widgets array when it is the last js to load
                            self.widgets[location].push(wdg);
                        } else {
                            var nextFile = widgetJsArray[currentIndex++];
                            self.lazyLoad(wdg, currentIndex, widgetJsArray, nextFile);
                        }
                    });
                })(wdg);
            },

            initializeWidgets: function (widgets, location, finishedCB) {
                var self = this;

                self.widgets[location] = [];

                for (var i in widgets) {
                    var wdg = widgets[i];

                    // loop to load the js (if exist)
                    if (wdg.widgetId.widgetJavascript) {
                        this.lazyLoad(wdg, 0, wdg.widgetId.widgetJavascript, wdg.widgetId.widgetJavascript[0], location);
                    } else {
                        self.widgets[location].push(wdg);
                    }
                }

                if(finishedCB)
                    finishedCB(self.widgets[location]);
            },

            isInitialized: function (location) {
                if (!this.widgets[location]) {
                    return false;
                }

                return true;
            },

            addWidget: function (location, id) {
                var self = this;

                var loc = '#' + location + '-widgets';
                var grid = $(loc).data('gridstack');

                var el = '#w' + id;

                // get width and height
                var i = _.findIndex(self.widgets[location], {'widgetId': {'_id': id}});
                var wdg = self.widgets[location][i];

                //add_widget(el, x, y, width, height, auto_position)
                var x = 0;
                var y = 0;
                if (wdg.position) {
                    x = wdg.position.x;
                    y = wdg.position.y;
                }

                grid.add_widget(el, x, y, wdg.width, wdg.height, false);
            },

            initWidgetButton: function (location, id) {
                $.AdminLTE.boxWidget.activate();
                this.addWidget(location, id);

                var h = $('#w' + id + ' .grid-stack-item-content');
                $('#w' + id + ' .grid-stack-item-content .box-body').css('height', (h.innerHeight() - 40) + 'px');
            },

            install: function (location, application, name, extraParams) {
                var params = {
                    application: application,
                    widget: name,
                    location: location
                };

                params = _.merge(params, extraParams);

                $http.put('/api/widgets/install', params)
                    .success(function (data) {
                        if (data.result) {
                            $rootScope.$broadcast('onAfterInstall' + location, data.installed);

                            if (success)
                                success(data.installed);
                        }
                    })
                    .error(function (data) {
                        if (error)
                            error(data.errors);
                    });
            },

            uninstall: function (installId, success, error) {
                var self = this;

                $http.put('/api/widgets/uninstall/' + installId, {})
                    .success(function (data) {
                        if (data.result) {
                            $rootScope.$broadcast('onAfterUninstall' + data.uninstalled.location, data.uninstalled);
                            self.uninstalledwidgets.push(installId);

                            if (success)
                                success(data.uninstalled);
                        }
                    })
                    .error(function (data) {
                        if (error)
                            error(data.errors);
                    });
            },

            setPosition: function (wId, x, y, success, error) {
                $http.put('/api/widget/' + wId + '/setPosition', {
                        x: x, y: y
                    })
                    .success(function (res) {
                        if (success)
                            success(res);
                    })
                    .error(function (data) {
                        if (error)
                            error(data.errors);
                    });
            },

            initiateDraggableGrid: function (locs, enableDragging) {
                var self = this;

                var loc = '#' + locs + '-widgets';

                var options = {
                    cell_height: 340,
                    vertical_margin: 10,
                    resizable: false
                };

                if(!enableDragging){
                    options.draggable = {'disabled': true};
                }

                var curNode = {x: 0, y: 0};

                var $gs = $(loc);
                $gs.gridstack(options);

                if(enableDragging){
                    $gs.on('onStartMove', function (e, node) {
                        curNode.x = node.x;
                        curNode.y = node.y;
                    });

                    $gs.on('onMove', function (e, node) {

                    });

                    $gs.on('onFinishDrop', function (e, node) {
                        var o = $(node.el);

                        if (options.allowed_grids && options.allowed_grids.indexOf(node.x) < 0) {
                            o.attr('data-gs-x', curNode.x).attr('data-gs-y', curNode.y);
                        }

                        var wId = o.attr('id').substr(1);
                        self.setPosition(wId, node.x, node.y);
                    });
                }
            }
        }
    }
]);