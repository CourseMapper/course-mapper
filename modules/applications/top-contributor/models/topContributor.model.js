var mongoose = require('mongoose');

var topContributorSchema = new mongoose.Schema();
topContributorSchema.set('usePushEach', true);

topContributorSchema.add({

    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courses'
    },
    countCourseActivity : {type: Number},
    countNodeActivity : {type:Number},
    totalCount : {type:Number},
    isEnrolled : Boolean
});

var topContributorAgg = mongoose.model('topContributor', topContributorSchema);

module.exports = topContributorAgg;