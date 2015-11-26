var fs = require('fs');
var p = require('path');
var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Tabs = require(appRoot + '/modules/tabs/models/tabs.schema.js');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var _ = require('underscore');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

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
    Tabs.find(params)
        .sort({location: 1, orderNo: 1})
        .exec(function (err, tabs) {
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
 *
 * @param location
 * @returns {function(): Promise<TResult>}
 */
TabsStore.prototype.getActiveTabs = function (location) {
    return async(function () {
        var tabs = await(Tabs.find({location: location})
            .sort({orderNo: 1})
            .exec());

        return tabs;
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

            if (dir == 'models')
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
            } catch (e) {

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
            var defTabs = self.populateDefaultTabs();

            var apps = apps.concat(defTabs);

            for (var i in apps) {
                var app = apps[i];

                (function (app) {
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
                            if (app.isDefaultActivated)
                                app.isActive = true;

                            var newTab = new Tabs(app);
                            newTab.save();
                        }
                    });
                })(app);
            }

            self.getTabs(
                function (err) {

                },
                {}//find all tabs in db
                ,
                function (tabs) {
                    for (var k in tabs) {
                        var w = tabs[k];

                        // now delete the tabs that are in db, but not in config.json
                        if (!_.findWhere(apps, {name: w.name})) {
                            w.remove(function () {
                            });
                        }
                    }
                }
            );

        }

        success();
    });

};

TabsStore.prototype.populateDefaultTabs = function () {
    var self = this;

    var configPath = self.directory + p.sep + 'models' + p.sep + 'defaultTabs.json';
    var stats = fs.lstatSync(configPath);

    if (stats.isFile()) {
        // lets read the config file
        var json = fs.readFileSync(configPath, 'utf8');
        var vtabs = JSON.parse(json);

        return vtabs;
    }

    return [];
};

module.exports = TabsStore;
