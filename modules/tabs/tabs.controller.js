var fs = require('fs');
var p = require('path');
var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Tabs = require(appRoot + '/modules/tabs/models/tabs.schema.js');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var userHelper = require(appRoot + '/modules/accounts/user.helper.js');
var _ = require('underscore');

function TabsStore() {
    this.directory = appRoot + '/modules/tabs';
}

TabsStore.prototype.init = function () {
};

/**
 *
 * @param error cb
 * @param params
 * @param success cb
 */
TabsStore.prototype.getTabs = function (error, params, success) {
    Tabs.find(params, function (err, tabs) {
        if (err)
            error();
        else
            success(tabs);
    });
};

TabsStore.prototype.getTab = function (error, params, success) {
    Tabs.findOne(params, function (err, tab) {
        if (err)
            error();
        else
            success(tab);
    });
};

/**
 *
 * @param failed cb
 * @param params
 * @param success cb
 */
TabsStore.prototype.updateTab = function (failed, params, updateParams, success) {
    Tabs.findOneAndUpdate(params, updateParams, {upsert: true}, function (err, tab) {
        if (err)
            failed(err);
        else
            success(tab);
    });
};

/**
 * read through applications directory, and detect for config.json
 *
 * @param failed
 * @param success
 */
TabsStore.prototype.readTabs = function (failed, success) {
    var self = this;

    fs.readdir(self.directory + p.sep, function (err, paths) {
        if (err) throw err;

        var appsPool = [];

        for (var i in paths) {
            var dir = paths[i];

            if(dir == 'models')
                continue;

            // check if the config file exist
            try {
                var configPath = self.directory + p.sep + dir + p.sep + 'config.json';
                var stats = fs.lstatSync(configPath);

                if (stats.isFile()) {
                    // lets read the config file
                    var json = fs.readFileSync(configPath, 'utf8');
                    var app = JSON.parse(json);
                    app.name = dir;
                    appsPool.push(app);
                }
            } catch(e){

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
TabsStore.prototype.populateTabs = function (failed, success) {
    var self = this;

    self.readTabs(failed, function (apps) {
        if (apps) {
            for (var i in apps) {
                var app = apps[i];

                // get the widgets on the db that is in this app.
                self.getTab(failed, {name: app.name}, function (theTab) {

                    // first we need to get the widget, is it in the db or not
                    if (theTab) {
                        // tab is already exist, renew with the newest vals
                        _.extend(theTab, app);
                        theTab.save();
                    } else {
                        // new tab
                        // create new because it doesnt exist yet
                        var newTab = new Tabs(app);
                        newTab.save();
                    }
                }.bind({app: app}));
            }

            self.getTabs(
                function (err) {

                },
                {}//find all tabs in db
                ,
                function (tabs) {
                    for (var k in tabs) {
                        var w = tabs[k];

                        if (!_.findWhere(apps, {name: w.name})) {
                            w.remove(function () {});
                        }
                    }
                }
            );
            // now delete the tabs that are in db, but not in config.json

        }

        success();
    });
};

/**
 * get installed widget based on parameters
 * e.g {location, userId, courseId, nodeId}
 * @param error
 * @param params
 * @param success
 */
TabsStore.prototype.getInstalledTabs = function (error, params, success) {
    if (params.courseId)
        params.courseId = mongoose.Types.ObjectId(params.courseId);

    if (params.userId)
        params.userId = mongoose.Types.ObjectId(params.userId);

    WP.find(params).populate('widgetId').exec(
        function (err, widgets) {
            if (err) error(err);
            else {
                success(widgets);
            }
        }
    );
};


module.exports = TabsStore;
