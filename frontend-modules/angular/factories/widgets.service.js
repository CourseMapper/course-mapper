app.factory('widgetService', [
    '$http', '$rootScope', '$ocLazyLoad', '$timeout',

    function ($http, $rootScope, $ocLazyLoad, $timeout) {
        return {
            widgets: [],
            uninstalledwidgets: [],
            installedWidgets: [],

            getWidgetsOnLocation: function (location, id, success, error, force) {
                var self = this;

                if (!force && self.installedWidgets[location]) {
                    self.initializeWidgets(self.installedWidgets[location], location, function () {
                        if (success) {
                            success(self.installedWidgets[location]);
                        }
                    });
                }

                else if (force || !self.widgets[location])
                    $http.get('/api/widgets/' + location + '/' + id)
                        .success(function (data) {
                            self.installedWidgets[location] = [];

                            if (data.result) {
                                self.installedWidgets[location] = data.widgets;

                                self.initializeWidgets(data.widgets, location, function () {
                                    if (success) {
                                        success(self.widgets[location]);
                                    }
                                });
                            } else if (error)
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
                    if (wdg.widgetId != null && wdg.widgetId.widgetJavascript) {
                        this.lazyLoad(wdg, 0, wdg.widgetId.widgetJavascript, wdg.widgetId.widgetJavascript[0], location);
                    } else {
                        self.widgets[location].push(wdg);
                    }
                }

                if (finishedCB)
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
                var i = _.findIndex(self.widgets[location], {'_id': id});
                var wdg = self.widgets[location][i];

                //add_widget(el, x, y, width, height, auto_position)
                var x = 0;
                var y = 0;
                if (wdg.position) {
                    x = wdg.position.x;
                    y = wdg.position.y;
                }

                grid.addWidget(el, x, y, wdg.width, wdg.height, false);
            },

            initWidgetButton: function (location, id) {
                //$.AdminLTE.boxWidget.activate();
                this.addWidget(location, id);

                var h = $('#w' + id);
                $('#w' + id + ' .grid-stack-item-content .box-body').css('height', (h.innerHeight() - 40) + 'px');
            },

            install: function (location, application, name, extraParams, successCb, errorCb) {
                var params = {
                    application: application,
                    widget: name,
                    location: location
                };

                params = _.merge(params, extraParams);

                $http.put('/api/widgets/install', params)
                    .success(function (data) {
                        if (data.result) {
                            if (successCb)
                                successCb(data.installed);
                        } else if (errorCb)
                            errorCb(data.errors);
                    })
                    .error(function (data) {
                        if (errorCb)
                            errorCb(data.errors);
                    });
            },

            uninstall: function (installId, extraParams, successCb, errorCb) {
                var self = this;

                $http.put('/api/widgets/uninstall/' + installId, extraParams)
                    .success(function (data) {
                        if (data.result) {
                            self.uninstalledwidgets.push(installId);

                            if (successCb)
                                successCb(data.uninstalled);
                        }
                        else if (errorCb)
                            errorCb(data.errors);
                    })
                    .error(function (data) {
                        if (errorCb)
                            errorCb(data.errors);
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
                var loc = '#' + locs + '-widgets';

                var options = {
                    cellHeight: 340,
                    verticalMargin: 10,
                    resizable: false
                };

                if (!enableDragging) {
                    options.disableDrag = true;
                }

                var $gs = $(loc);
                $gs.gridstack(options);
            },

            onchangelistener: function (evt, node) {
                var self = this;
                for (var i in node) {
                    var nd = node[i];
                    var c = $(nd.el);
                    if (c) {
                        var wId = c.attr('id').substr(1);
                        //if (nd._updating)
                        {
                            var x = nd.x;
                            var y = nd.y;

                            self.setPosition(wId, x, y);
                            self.setLocalPosition(wId, x, y);
                        }
                    }
                }
            },

            setLocalPosition: function (wId, x, y) {
                for (var i in this.widgets) {
                    var wdgs = this.widgets[i];
                    for (var j in wdgs) {
                        var wdg = wdgs[j];
                        if (wdg && wdg._id == wId) {
                            this.widgets[i][j].position.x = x;
                            this.widgets[i][j].position.y = y;
                            wdg.position.x = x;
                            wdg.position.y = y;
                        }
                    }
                }
            },

            initiateDragStop: function (locs) {
                var self = this;

                var loc = '#' + locs + '-widgets';
                var $gs = $(loc);
                //$gs.off('change', self.onchangelistener);
                $gs.on('change', function (evt, node) {
                    for (var i in node) {
                        var nd = node[i];
                        var c = $(nd.el);
                        if (c) {
                            var wId = c.attr('id').substr(1);
                            //if (nd._updating)
                            {
                                var x = nd.x;
                                var y = nd.y;

                                self.setPosition(wId, x, y);
                                self.setLocalPosition(wId, x, y);
                            }
                        }
                    }
                });
            }
        }
    }
]);