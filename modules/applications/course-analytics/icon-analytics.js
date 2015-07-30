var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function AStat(){
}

AStat.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.nodeId);
};

AStat.prototype.run = async ( function(){
    var self = this;
    self.result = '';
} );

AStat.prototype.render = function(){
    return  '<i class="fa fa-pencil-square"></i> 12' +
            '<i class="fa fa-link"></i> 5' +
            '<i class="fa fa-heart"></i> 12' +
            '<br>';
};

module.exports = AStat;