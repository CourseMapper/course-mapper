var appRoot = require('app-root-path');
//var mongoose = require('mongoose');
var Categories = require(appRoot + '/modules/catalogs/categories.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function CatStats(){
}

CatStats.prototype.init = function(params){
    this.slug = params.slug;
};

CatStats.prototype.run = async ( function(){
    var self = this;

    var result = await( Categories.findOne({
        slug: self.slug
    }).exec());

    self.result = result;
} );


CatStats.prototype.render = function(){
    return '<h4>' + this.result.name + '<h4>';
};

module.exports = CatStats;
