var appRoot = require('app-root-path');
var Links = require(appRoot + '/modules/links/models/links.js');
var Discussions = require(appRoot + '/modules/discussion/models/posts.js');
var VC = require(appRoot + '/modules/votes/votes.controller.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var LinksListener = {

    //Listener for Courses
    onAfterVoted: function (vote) {
        if (vote) {
            var vid = vote.voteTypeId;

            var voteC = new VC();
            voteC.getVotesSumOfAnItem(
                function error() {
                },
                vote.voteType,
                vid,
                null,
                function (summ) {
                    if (vote.voteType == 'link') {
                        var op = async(function () {
                            var lnk = await(Links.findOne({_id: vid}).exec());
                            if (lnk && summ) {
                                lnk.totalVotes = summ[0].total;
                                await(lnk.save());

                                return lnk;
                            }
                        });
                        op();
                    }

                    else if (vote.voteType == 'discussion' || vote.voteType == 'discussionReply') {
                        var op = async(function () {
                            var lnk = await(Discussions.findOne({_id: vid}).exec());
                            if (lnk && summ) {
                                lnk.totalVotes = summ[0].total;
                                await(lnk.save());

                                return lnk;
                            }
                        });
                        op();
                    }


                });
        }
    }
};

module.exports = LinksListener;
