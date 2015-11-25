var config = require('config');
var Votes = require('./models/votes.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');
var Plugin = require(appRoot + '/modules/apps-gallery/backgroundPlugins.js');

function votingSystem(){
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
votingSystem.prototype.getVotesSumOfAnItem = function(error, voteType, voteTypeId, userIdForVoter, success){
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
                _id : "$voteTypeId",
                total: {
                    $sum: "$voteValue"
                }
            }
        }
    ])
        .exec(function(err, summary) {
            if (err){
                error(err);
            } else {
                if(userIdForVoter){

                    // find whether this user is voting for this item
                    Votes.findOne({
                        createdBy: userIdForVoter,
                        voteTypeId: voteTypeId,
                        voteType: voteType
                    }).exec(function(err, isVotingObject){
                        if(err)
                            error(err);
                        else {
                            if(isVotingObject){
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

votingSystem.prototype.getVotesOfAnItem = function(error, voteType, voteTypeId, success){
    Votes.find({
        voteTypeId: voteTypeId,
        voteType: voteType
    })
        .exec(function(err, docs) {
            if (err){
                error(err);
            } else {
                success(docs);
            }
        });
};

votingSystem.prototype.insertVote = function(error, createdBy, voteType, voteTypeId, voteValue, success){
    Votes.findOneAndUpdate({
            createdBy: createdBy,
            voteTypeId: voteTypeId,
            voteType: voteType
        },
        {
            voteValue: voteValue
        },
        {
            upsert:true
        })
        .exec(function(err, doc){
            if(err)
                error(err);
            else {
                Plugin.doAction('onAfterVoted', doc);
                success(doc);
            }
        });
};

module.exports = votingSystem;