/**
 * loop through a folder to find *.js for route files, and register each of its routes to app
 */

var fs = require('fs');
var p = require('path');
var debug = require('debug')('cm:server');

function multiRouter( app, directory ) {
    this.directory = directory;
    this.app = app;
}

multiRouter.prototype.populateRoutes = function(prefix){
    if (!prefix)
        prefix = '/';

    var routeFiles = fs.readdirSync(this.directory + p.sep + prefix);

    for(var i in routeFiles){
        var routeFN = routeFiles[i];

        // variables for directory checking
        var newPath = p.join(this.directory + p.sep + prefix, routeFN);
        var stats = fs.lstatSync(newPath);

        // check if it is a dir
        if(stats.isDirectory()){
            debug('it is a dir, recall: ' + routeFN);

            // this is a directory, so we have to call this method again
            this.populateRoutes(p.normalize(prefix + p.sep + routeFN));
        } else {
            var requiring = this.directory + p.sep + prefix + p.sep + routeFN;
            // it is a route file, so initiate it
            debug('it is a file. requiring: ' + requiring);

            var route = require(requiring);
            this.app.use(prefix, route);

            debug('initiate route:' + prefix);
        }
    }
};

module.exports = multiRouter;