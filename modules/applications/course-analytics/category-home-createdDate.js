var appRoot = require('app-root-path');
//var mongoose = require('mongoose');
var Categories = require(appRoot + '/modules/catalogs/categories.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function CatCreatedDate(){
}

CatCreatedDate.prototype.init = function(params){
    this.slug = params.slug;
};

CatCreatedDate.prototype.run = async ( function(){
    var self = this;

    var result = await( Categories.findOne({
        slug: self.slug
    }).exec());

    self.result = result;
} );


CatCreatedDate.prototype.render = function(){
    //TODO: change with moment-angular js for better date formatting
    var date = new Date(this.result.dateAdded);
    var d = date.getDay();
    var m = date.getMonth()+1;
    var y = date.getFullYear();

    return '<div class="dateCreated" style="font-size:80%"> Created On: ' + d + '/' + m + '/' + y + '</div>' ;
};

module.exports = CatCreatedDate;
