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

    var routeFiles = fs.readdirSync(this.directory + '/' + prefix);

    for(var i in routeFiles){
        var routeFN = routeFiles[i];

        // variables for directory checking
        var newPath = p.join(this.directory + '/' + prefix, routeFN);
        var stats = fs.lstatSync(newPath);

        // check if it is a dir
        if(stats.isDirectory()){
            if(prefix == '/')
                prefix = '';

            debug('it is a dir, prefix: ' + (prefix + '/' + routeFN));

            // this is a directory, so we have to call this method again
            this.populateRoutes(prefix + '/' + routeFN);
        } else {
            var requiring = p.normalize(this.directory + '/' + prefix + '/' + routeFN);
            var route = require(requiring);
            this.app.use(prefix, route);

            debug('initiate route:' + prefix + ' on ' + requiring);
        }
    }
};

module.exports = multiRouter;