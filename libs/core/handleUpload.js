var fs = require('fs-extra');
var debug = require('debug')('cm:server');

var handleUpload = function(file, destination, overwrite){
    if(!overwrite)
        overwrite = false;

    fs.move(file.path, destination, {clobber:overwrite} , function (err) {
        if (err) return debug(err);
        debug("success moved file!");
    });
};

module.exports = handleUpload;