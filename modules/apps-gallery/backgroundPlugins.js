var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var _ = require('underscore');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var Widgets = require('./widgets.js');
var fs = require('fs');
var p = require('path');

var debug = require('debug')('cm:server');

var BackgroundPlugins = {
    /**
     * main code that execute the hooks
     *
     * @param hookName
     * @param params
     */
    doAction : function(hookName, params, extraParams){
        var rules = [{isActive: true}];
        Widgets.aggregate([
            { $match: {$and: rules} },
            {
                $group: {
                    // grouping key - group by field application
                    _id: '$application'
                }
            }
        ],

        // find plugins that are active
        //Widgets.find({isActive: true},
         function(err, docs){
            if(!err){
                for(var i in docs){
                    var wdg = docs[i];

                    // check if this plugin contain a file that contain logic
                    var fname = appRoot + '/modules/applications/' + wdg._id + '/' + wdg._id + '.js';
                    try {
                        var stats = fs.lstatSync(fname);
                        if (stats.isFile()) {
                            var plugCode = require(fname);

                            // check if this file has hook
                            if (typeof plugCode[hookName] === "function") {
                                try {
                                    // safe to use the function
                                    plugCode[hookName](params, extraParams);

                                } catch (e) {
                                    debug(e);
                                }
                            }
                        }
                    } catch (e) {
                        //debug('no hook logic file exist');
                    }
                }
            }
        });
    }
};

module.exports = BackgroundPlugins;
