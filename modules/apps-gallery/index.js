var installedApps = require('./temp_moduledb.js');
var fs = require('fs');
var p = require('path');
var appRoot = require('app-root-path');
//var config = require('config');
//var mongoose = require('mongoose');

function appStore(){
    this.directory = appRoot + '/modules/applications';
}

appStore.prototype.init = function(){

};

/**
 * getting app list and widgets inside
 * todo: make it get from DB instead of reading and parsing json files
 */
appStore.prototype.getApps = function(failed, isActive, success){
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
 * @param isAppActive Boolean
 * @param params {location:String, isActive:Boolean}
 * @param success cb
 */
appStore.prototype.getWidgets = function(failed, isAppActive, params, success){

    this.getApps(
        failed,
        true,
        function (apps){
            var widgetPools = [];
            // loop apps
            apps.forEach(function(app){
                // check for widgets location and isActive
                app.widgets.forEach(
                    function filterWidget(widget){
                        // lets populate with its parent
                        widget.app = {name:app.name, description:app.description};
                        // filter by location
                        if(params.location && params.location == widget.location){
                            if(params.isActive){
                                // only get what is active
                                if(widget.isActive) widgetPools.push(widget);
                            }
                            else{
                                // dont care if its active or no
                                // put all widget in pool
                                widgetPools.push(widget);
                            }
                        }
                        // not filtered by location
                        else if(!params.location){
                            if(params.isActive){
                                // only get what is active
                                if(widget.isActive)
                                    widgetPools.push(widget);
                            }
                            else{
                                // put all widget in pool
                                widgetPools.push(widget);
                            }
                        }
                });
            });

            success(widgetPools);
        }
    );
};

module.exports = appStore;
