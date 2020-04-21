var appRoot = require('app-root-path');
var mongoose = require('mongoose');
var Courses = require(appRoot + '/modules/catalogs/courses.js');
var TN = require(appRoot + '/modules/trees/treeNodes.js');
var Resources = require(appRoot + '/modules/trees/resources.js');
var Links = require(appRoot + '/modules/links/models/links.js');
var PdfAnnotation = require(appRoot + '/modules/slide-viewer/annotation.js');
var VideoAnnotation = require(appRoot + '/modules/annotations/video-annotation.js');
var ExtResources = require(appRoot + '/modules/learningHub/models/hub.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

function AStat() {
}

AStat.prototype.init = function (params) {
    this._id = mongoose.Types.ObjectId(params.nodeId);
    //console.log(this._id)
};

AStat.prototype.run = async(function () {
    var self = this;

    var contentNodeDetail = await(TN.findOne({
        _id: self._id
    }).exec());

    var arrResources = contentNodeDetail.resources;
    var contentId = contentNodeDetail._id;

    // var totalLinks = await(Links.find({
    //     contentNode: contentId,
    //     isDeleted: false
    // }).count().exec());

    var totalExtResources = await(ExtResources.posts.find({
        contentId: contentId,
        isDeleted: false
    }).count().exec());

    var arrResourcesLength = arrResources.length;
    var sumAnnoVideo = 0;
    var sumAnnoPdf = 0;

    for (var i = 0; i < arrResourcesLength; i++) {
        var a = await(Resources.findOne({
            _id: arrResources[i]
        }).exec());
        if (a.type === "video") {
            sumAnnoVideo = await(VideoAnnotation.find({
                video_id: a._id
            }).count().exec());
        } else if (a.type === "pdf") {
            sumAnnoPdf = await(PdfAnnotation.find({
                pdfId: a._id
            }).count().exec());
        }


    }
    self.arr = arrResources;
    self.contentNodeDetail = contentNodeDetail;
    self.test = arrResources;
    //self.tl = totalLinks;
    self.sumExtResources = totalExtResources;

    if (sumAnnoPdf) {
        self.sumAnnoPdf = sumAnnoPdf;
    } else {
        self.sumAnnoPdf = 0;
    }
    if (sumAnnoVideo) {
        self.sumAnnoVideo = sumAnnoVideo;
    } else {
        self.sumAnnoVideo = 0;
    }

});


AStat.prototype.render = function () {
    return '<div class="icon-stat" style="text-align: center">' +
        '<div class="badge bg-light-blue" style="text-align: center; margin-bottom: 3px;"><i class="fa fa-file-pdf-o" style="font-size: 12px"></i> PDF Annotations: ' + this.sumAnnoPdf + '</div> ' +
        '<div class="badge bg-light-blue" style="text-align: center; margin-bottom: 3px;"><i class="fa fa-file-movie-o" style="font-size: 12px"></i> Video Annotations: ' + this.sumAnnoVideo + '</div> ' +
        '<div class="badge bg-light-blue" style="text-align: center; margin-bottom: 3px;"><i class="fa fa-link" style="font-size: 12px"></i> External Resources: ' + this.sumExtResources + '</div> ' +
        '</div>';
};
// '<div class="badge bg-light-blue" style="text-align: center; margin-bottom: 3px;"><i class="fa fa-link" style="font-size: 12px"></i> Link Added: '+ this.tl +'</div> ' +


module.exports = AStat;