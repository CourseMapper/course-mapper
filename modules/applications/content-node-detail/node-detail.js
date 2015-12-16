var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var TN = require(appRoot + '/modules/trees/treeNodes.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var moment = require('moment');

function CNWidget() {
}

CNWidget.prototype.init = function (params) {
    this._id = mongoose.Types.ObjectId(params.nodeId);
};

CNWidget.prototype.run = async(function () {
    var self = this;

    var result = await(TN.findOne({
            _id: self._id
        })
        .populate('createdBy')
        .exec());

    self.result = result;
});


CNWidget.prototype.render = function () {
    var self = this;

    if (!self.result)
        return;

    var d = moment(self.result.dateAdded).fromNow();

    var text = 'Started ' + d +' <br> By ' + self.result.createdBy.displayName;
    return '<div class="icon-stat" style="text-align: center;padding-top:2px;width:160px;overflow: hidden">' +
        '<small class="" style="text-align: center;"> ' + text + '</small> ' +
        '</div>';
};

module.exports = CNWidget;