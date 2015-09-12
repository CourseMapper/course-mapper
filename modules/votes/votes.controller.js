var config = require('config');
var Votes = require('./models/votes.js');
var mongoose = require('mongoose');
var debug = require('debug')('cm:db');
var appRoot = require('app-root-path');
var helper = require(appRoot + '/libs/core/generalLibs.js');

function votingSystem(){
}

/**
 * find root posts based on params,
 * populate all of its child posts
 *
 * @param error
 * @param params
 * @param success
 */
votingSystem.prototype.getVotesSumOfAnItem = function(error, voteTypeId, voteType, success){
    Votes.aggregate([
        {
            $match: {
                voteTypeId: voteTypeId,
                voteType: voteType
            }
        }
        ,
        {
            $project: {
                voteTypeId: 1,
                total: {
                    $sum: "$voteValue"
                }
            }
        }
    ])
        .exec(function(err, docs) {
            if (err){
                error(err);
            } else {
                success(docs);
            }
        });
};

votingSystem.prototype.getVotesOfAnItem = function(error, voteTypeId, voteType, success){
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

votingSystem.prototype.insertVote = function(error, createdBy, voteTypeId, voteType, voteValue, success){
    Votes.findOneAndUpdate({
            createdBy: mongoose.Types.ObjectId(createdBy),
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
                success(doc);
            }
        });
};

module.exports = votingSystem;