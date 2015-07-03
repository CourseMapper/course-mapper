var fs = require('fs');
var p = require('path');
var appRoot = require('app-root-path');
//var config = require('config');
var Widgets = require(appRoot + '/modules/apps-gallery/widgets.js');
var _ = require('underscore');

function AppStore(){
    this.directory = appRoot + '/modules/applications';
}

AppStore.prototype.init = function(){

};

/**
 * getting app list and widgets inside
 * todo: make it get from DB instead of reading and parsing json files
 */
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
};

/**
 *
 * @param failed cb
 * @param params
 * @param success cb
 */
AppStore.prototype.getWidgets = function(failed, params, success){
    Widgets.find(params, function(err, widgets){
        if(err)
            failed(err);

        else{
            success(widgets);
        }
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
                self.getWidgets(failed, {application: app.dir}, function(widgets){

                    for(var j in app.widgets) {
                        var wdg = app.widgets[j];

                        // first we need to get the widget, is it in the db or not
                        if(existing = isWidgetExist(wdg, widgets)){
                            // this widget is already in DB
                            // update with the newest value
                            _.extend(existing, wdg);

                            existing.save();
                        }
                        else {
                            // create new because it doesnt exist yet
                            wdg.application = app.dir;
                            var newApp = new Widgets(wdg);
                            newApp.save();
                        }
                    }

                    // now delete the widgets that are in db, but not in config.json
                    for(var k in widgets){
                        var w = widgets[k];
                        if(!isWidgetExist(w, app.widgets)){
                            Widgets.findByIdAndRemove(w._id, function(err, success){});
                        }
                    }
                });
            }
        }

        success();
    });
};

AppStore.prototype.getWidgets = function(error, params, success){
    Widgets.find(params, function(err, widgets){
        if(err)
            error();
        else
            success(widgets);
    });
};

module.exports = AppStore;