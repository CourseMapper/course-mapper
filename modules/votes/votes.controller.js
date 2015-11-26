var Votes = require('./models/votes.js');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var helper = require(appRoot + '/libs/core/generalLibs.js');

function votingSystem() {
}

/**
 * find the sum total vote of an item
 * pass in userIdForVoter if you also want to find whether this user has voted for this item or not.
 *
 * @param error
 * @param voteType
 * @param voteTypeId
 * @param userIdForVoter
 * @param success
 */
votingSystem.prototype.getVotesSumOfAnItem = function (error, voteType, voteTypeId, userIdForVoter, success) {
    Votes.aggregate([
            {
                $match: {
                    voteTypeId: voteTypeId,
                    voteType: voteType
                }
            }
            ,
            {
                $group: {
                    _id: "$voteTypeId",
                    total: {
                        $sum: "$voteValue"
                    }
                }
            }
        ])
        .exec(function (err, summary) {
            if (err) {
                error(err);
            } else {
                if (userIdForVoter) {

                    // find whether this user is voting for this item
                    Votes.findOne({
                        createdBy: userIdForVoter,
                        voteTypeId: voteTypeId,
                        voteType: voteType
                    }).exec(function (err, isVotingObject) {
                        if (err)
                            error(err);
                        else {
                            if (isVotingObject) {
                                summary[0].isVotingObject = isVotingObject;
                            }

                            success(summary);
                        }
                    });
                }
                else
                    success(summary);
            }
        });
};

votingSystem.prototype.getVotesOfAnItem = function (error, voteType, voteTypeId, success) {
    Votes.find({
            voteTypeId: voteTypeId,
            voteType: voteType
        })
        .exec(function (err, docs) {
            if (err) {
                error(err);
            } else {
                success(docs);
            }
        });
};

votingSystem.prototype.insertVote = function (error, createdBy, voteType, voteTypeId, voteValue, success) {
    var op = async(function () {
        var vote = await(Votes.findOne({
            createdBy: createdBy,
            voteTypeId: voteTypeId,
            voteType: voteType
        }).exec());

        if (!vote) {
            vote = new Votes({
                createdBy: createdBy,
                voteTypeId: voteTypeId,
                voteType: voteType
            });
        }

        vote.voteValue = voteValue;
        vote.save();
        return vote;
    });

    op()
        .then(function (vote) {
            Plugin.doAction('onAfterVoted', vote);
            success(vote);
        })
        .catch(function (err) {
            helper.resReturn(err, res);
        });
};

module.exports = votingSystem;