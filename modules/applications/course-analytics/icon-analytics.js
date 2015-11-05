var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function AStat(){
}

AStat.prototype.init = function(params){
    this._id = mongoose.Types.ObjectId(params.cid);
    //console.log(this._id)
};

AStat.prototype.run = async ( function(){
    var self = this;

    var result = await( Courses.findOne({
        _id: self._id
    }).exec());

    self.result = result;
} );


AStat.prototype.render = function(){
    return  '<div class="icon-stat" style="text-align: center">' +
                '<div class="badge bg-light-blue" style="text-align: center"><i class="fa fa-pencil-square" style="font-size: 12px"></i> '+ '-' +'</div> '+
                '<div class="badge bg-light-blue" style="text-align: center"><i class="fa fa-link" style="font-size: 12px"></i> '+ '-' +'</div> ' +
                '<div class="badge bg-light-blue" style="text-align: center"><i class="fa fa-heart" style="font-size: 12px"></i> '+ '0' +'</div> ' +
            '</div>';
};

module.exports = AStat;