var fs = require('fs');

function multiRouter( app, directory ) {
    this.directory = directory;
    this.app = app;
}

multiRouter.prototype.populateRoutes = function(){
    var routeFiles = fs.readdirSync(this.directory);

    for(var i in routeFiles){
        var routeFN = routeFiles[i];

        var route = require(this.directory + "/" + routeFN);
        route.doRoute(this.app);
    }
};

module.exports = multiRouter;