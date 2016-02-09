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

    var text = 'Created ' + d +' <br> By ' + self.result.createdBy.displayName;
    return '<div class="icon-stat bg-green" style="text-align: center;padding-top:2px;width:160px;overflow: hidden; margin-bottom: 5px;">' +
        '<small class="label label-success" style="text-align: center;"> <i class="fa fa-clock-o"></i> ' + text + '</small> ' +
        '</div>';
};

module.exports = CNWidget;