var fs = require('fs');
var p = require('path');
var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Widgets = require(appRoot + '/modules/apps-gallery/widgets.js');
var WP = require(appRoot + '/modules/apps-gallery/widgetsPlacements.js');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var _ = require('underscore');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function AppStore(){
    this.directory = appRoot + '/modules/applications';
}

AppStore.prototype.init = function(){};

/**
 *
 * @param error cb
 * @param params
 * @param success cb
 */
AppStore.prototype.getWidgets = function(error, params, success){
    Widgets.find(params, function(err, widgets){
        if(err)
            error();
        else
            success(widgets, params);
    });
};

/**
 *
 * @param failed cb
 * @param params
 * @param success cb
 */
AppStore.prototype.updateWidget = function(failed, params, updateParams, success){
    Widgets.findOneAndUpdate(params, updateParams, {upsert:true}, function(err, wdg){
        if(err)
            failed(err);
        else
            success(wdg);
    });
};

/**
 * read through applications directory, and detect for config.json
 *
 * @param failed
 * @param success
 */
AppStore.prototype.readApps = function(failed, success){
    var self = this;

    fs.readdir(self.directory + p.sep, function(err, paths){
        if (err) throw err;

        var appsPool = [];

        for(var i in paths){
            var dir = paths[i];

            // check if the config file exist
            var configPath = self.directory + p.sep + dir + p.sep + 'config.json';
            var stats = fs.lstatSync(configPath);

            if(stats.isFile()){
                // lets read the config file
                var json = fs.readFileSync(configPath, 'utf8');
                var app = JSON.parse(json);
                app.dir = dir;
                appsPool.push(app);
            }
        }

        success(appsPool);
    });
};

/**
 * loop through readApps result, delete the deleted app from config.js
 * update based on config.js otherwise
 * @param failed
 * @param success
 */
AppStore.prototype.populateApplications = function(failed, success){
    var self = this;

    // inner function to check if this widget exist in the db
    function isWidgetExist(widget, widgetsInDB){
        for(var i in widgetsInDB){
            var wdb = widgetsInDB[i];
            if(wdb.name == widget.name){
                return wdb;
            }
        }

        return false;
    }

    self.readApps(failed, function(apps){
        if(apps){
            for(var i in apps){
                var app = apps[i];

                // get the widgets on the db that is in this app.
                self.getWidgets(failed, {application: app.dir}, function(widgets, p){

                    for(var j in this.app.widgets) {
                        var wdg = this.app.widgets[j];

                        // first we need to get the widget, is it in the db or not
                        if(existing = isWidgetExist(wdg, widgets)){
                            // this widget is already in DB
                            // update with the newest value
                            _.extend(existing, wdg);

                            existing.save();
                        }
                        else {
                            // create new because it doesnt exist yet
                            wdg.application = p.application;
                            var newApp = new Widgets(wdg);
                            newApp.save();
                        }
                    }

                    // now delete the widgets that are in db, but not in config.json
                    for(var k in widgets){
                        var w = widgets[k];
                        if(!isWidgetExist(w, this.app.widgets)){
                            Widgets.findByIdAndRemove(w._id, function(err, success){});
                        }
                    }
                }.bind({app:app}));
            }
        }

        success();
    });
};

AppStore.prototype.getServerWidgets = function(error, params, widgetParams, success){
    params.runOn = 'server';
    Widgets.find(params).exec(
        function(err, docs){
            if(err) error(err);
            else{
                var resHtml = "";
                var loopWidgets = async ( function(docs){

                    for(var i in docs){
                        var widg = docs[i]; 

                        var ep = appRoot + ('/modules/applications' + widg.entryPoint);
                        var OBJ = require(ep);
                        var widgetInstance = new OBJ();

                        await ( widgetInstance.init(widgetParams) );
                        await ( widgetInstance.run() );

                        var resHtmlTemp = widgetInstance.render();
                        resHtml += resHtmlTemp;
                    }

                    return resHtml;
                });

                loopWidgets(docs)
                    .then(function(html){
                        success(html);
                    })
                    .catch(function(err){
                        console.log('getServerWidgets failed ' + err);
                        error(err);
                    })
                ;
            }
        }
    );

};

/**
 * get installed widget based on parameters
 * e.g {location, userId, courseId}
 * @param error
 * @param params
 * @param success
 */
AppStore.prototype.getInstalledWidgets = function(error, params, success){
    if(params.courseId)
        params.courseId = mongoose.Types.ObjectId(params.courseId);

    if(params.userId)
        params.userId = mongoose.Types.ObjectId(params.userId);

    WP.find(params).populate('widgetId').exec(
        function(err, widgets){
            if(err) error(err);
            else {
                success(widgets);
            }
        }
    );
};

AppStore.prototype.setPosition = function(error, params, x, y, success){
    if(x == null || y == null){
        error(new Error('x or y position is not provided'));
        return;
    }

    WP.findOne(params, function(err, doc){
        if(err) error(err);
        else {
            doc.position = {
                x: x,
                y: y
            };

            doc.save(function(err, w){
                if (err) {
                    error(err);
                } else {
                    // call success callback
                    success(w);
                }
            });
        }
    });
};

/**
 * install widget into the position
 * it has logic and filtering for different locations installation
 * @param error
 * @param params
 * @param success
 */
AppStore.prototype.installWidget = function(error, params, success){
    var self = this;

    function saveWidgetInstall(){
        // get the widget config
        self.getWidgets(
            error,
            {
                isActive: true,
                application: params.application,
                name: params.widget,
                location: params.location
            },

            function(widgets){
                if(widgets.length > 0){
                    var wdg = widgets[0];

                    // create the installation information
                    var ins = {
                        application: wdg.application,
                        widget: wdg.name,
                        widgetId: wdg._id,

                        location: wdg.location,
                        isInstalled: params.isInstalled,

                        width: wdg.width,
                        height: wdg.height,

                        position: {x:0, y:0}
                    };

                    if(params.userId)
                        ins.userId = params.userId;

                    if(params.courseId)
                        ins.courseId = params.courseId;

                    if(params.categoryId)
                        ins.categoryId = params.categoryId;

                    var where = {
                        application: wdg.application,
                        widget: wdg.name,
                        location: wdg.location
                    };

                    if(params.userId){
                        where.userId = params.userId
                    }

                    if(wdg.allowMultipleInstallation){
                        var newInstall = new WP(ins);
                        newInstall.save(function(err){
                            if(err){
                                error(err);
                            } else
                                success(newInstall);
                        });

                    } else {
                        WP.findOneAndUpdate(
                            where,
                            ins,

                            {upsert: true},

                            function (err, doc) {
                                if (err)
                                    error(err);
                                else
                                    success(doc);
                            }
                        );
                    }

                }
            }
        );
    }

    // check owner of this course and submitter
    if(params.courseId){
        // there is a courseId in params, means this is a course widgets
        if (!helper.checkRequiredParams(params, ['userId'], error)) {
            return;
        }

        userHelper.isManager(
            error, params.userId, params.courseId,

            function(ret){
                // is manager
                if(ret){
                    saveWidgetInstall();
                } else {
                    // check is owner
                    userHelper.isUserCreatedCourse(
                        error, params.userId, params.courseId,

                        function(ret){
                            // is owner
                            if(ret) {
                                saveWidgetInstall();
                            }
                            else {
                                error(helper.createError('Cannot edit course', 401));
                            }
                        }
                    )
                }
            }
        );
    }

    else {
        // we are here means there is no course id. possible location: user-profile
        if (!helper.checkRequiredParams(params, ['userId'], error)) {
            return;
        }

        saveWidgetInstall();
    }
};

/**
 *
 * @param error
 * @param params{_id:widgetPlacementId, userId:personInstallingId}
 * @param success
 */
AppStore.prototype.uninstallWidget = function(error, params, success){
    if (!helper.checkRequiredParams(params, ['_id', 'userId'], error)) {
        return;
    }

    WP.findOneAndUpdate(
        {
            _id: params._id,
            userId: params.userId
        },

        {
            isInstalled: false
        },

        {upsert: false},

        function (err, doc) {
            if (err)
                error(err);
            else if(doc)
                success(doc);
            else{
                error(helper.createError404('Widget Installation'));
            }
        }
    );
};

module.exports = AppStore;
