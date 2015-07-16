var fs = require('fs');
var p = require('path');
var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Widgets = require(appRoot + '/modules/apps-gallery/widgets.js');
var WP = require(appRoot + '/modules/apps-gallery/widgetsPlacements.js');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var _ = require('underscore');

function AppStore(){
    this.directory = appRoot + '/modules/applications';
}

AppStore.prototype.init = function(){ };

/**
 * getting app list and widgets inside
 * todo: make it get from DB instead of reading and parsing json files

AppStore.prototype.getApps = function(failed, isActive, success){
    var self = this;
    fs.readdir(self.directory + p.sep, function(err, paths){
        if (err) throw err;

        var appsPool = [];

        for(var i in paths){
            var dir = paths[i];

            // check if it exist
            var configPath = self.directory + p.sep + dir + p.sep + 'config.json';
            var stats = fs.lstatSync(configPath);

            if(stats.isFile()){
                // lets read the config file
                var json = fs.readFileSync(configPath, 'utf8');
                var app = JSON.parse(json);

                // only add app that is activated by admin
                if(isActive && app.isActive){
                    appsPool.push(app);
                }
                // add all
                else if(!isActive){
                    appsPool.push(app);
                }
            }
        }

        success(appsPool);
    });
};*/

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
    Widgets.findOneAndUpdate(params, updateParams, {new:true}, function(err, wdg){
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

/**
 * get installed widget based on parameters
 * e.g {location, userId, courseId}
 * @param error
 * @param params
 * @param success
 */
AppStore.prototype.getInstalledWidgets  = function(error, params, success){
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
                isActive:true,
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
                        height: wdg.height
                    };

                    if(params.userId)
                        ins.userId = mongoose.Types.ObjectId(params.userId);

                    if(params.courseId)
                        ins.courseId = mongoose.Types.ObjectId(params.courseId);

                    if(params.categoryId)
                        ins.categoryId = mongoose.Types.ObjectId(params.categoryId);

                    if(params.location == 'course-preview' || params.location == 'course-analytics'){
                        WP.findOneAndUpdate(
                            {
                                application: wdg.application,
                                widget: wdg.name,
                                location: wdg.location
                            },
                            ins,
                            {upsert:true},
                            function(err, doc){
                                if(err) error(err);
                                success(doc);
                            }
                        );
                    }
                    else if(params.location == 'user-profile'){
                        WP.findOneAndUpdate(
                            {
                                application: wdg.application,
                                widget: wdg.name,
                                userId: params.userId,
                                location: wdg.location
                            },
                            ins,
                            {upsert:true},
                            function(err, doc){
                                if(err) error(err);
                                success(doc);
                            }
                        );
                    }
                }
            }
        );
    }

    // check owner of this course and submitter
    if(params.location == 'course-preview' || params.location == 'course-analytics'){
        if(!params.courseId)
            throw ("no course id when location is course-preview");

        Courses.findOne({
            _id: mongoose.Types.ObjectId(params.courseId),
            createdBy:mongoose.Types.ObjectId(params.userId)
        })
        .exec(function(err, course){
            if (err)
                return error(err);
            // this user is the owner of this course
            if(course){
                saveWidgetInstall();
            }
        });
    }
    else if(params.location == 'user-profile'){
        saveWidgetInstall();
    }
};

module.exports = AppStore;
