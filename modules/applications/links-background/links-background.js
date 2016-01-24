var Links = require('../../links/models/links.js');
var VC = require('../../votes/votes.controller.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');

var LinksListener = {

    //Listener for Courses
    onAfterVoted: function (vote) {
        if (vote && vote.voteType == 'link') {
            var vid = vote.voteTypeId;

            var voteC = new VC();
            voteC.getVotesSumOfAnItem(
                function error() {
                },
                'link',
                vid,
                null,
                function (summ) {
                    var op = async(function () {
                        var lnk = await(Links.findOne({_id: vid}).exec());
                        if (lnk && summ) {
                            lnk.totalVotes = summ[0].total;
                            await(lnk.save());

                            return lnk;
                        }
                    });

                    op();
                });
        }
    }
};

module.exports = LinksListener;
