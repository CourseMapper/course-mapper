var debug = require('debug')('cm:server');
var NewsfeedAgg = require('./models/newsfeed.model.js');

var NewsfeedListener = {

    onAfterSubTopicCreated: function(newSubTopic){
        NewsfeedAgg.save(
            {userId: newSubTopic.createdBy, actionSubjectIds: newSubTopic._id , actionSubject: "tree node" , actionType : "added", dateAdded: newSubTopic.dateAdded},


            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            });

    },

    onAfterVoted: function(newVote){
        NewsfeedAgg.save(
            {userId: newVote.createdBy, actionSubjectIds: newVote._id , actionSubject: "vote" , actionType : "added", dateAdded: newVote.dateUpdated},


            function(err, doc){
                if(!err) debug('');
                else
                    debug(err);
            });

    }
};

module.exports = NewsfeedListener;
