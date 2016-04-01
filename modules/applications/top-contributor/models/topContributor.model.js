var mongoose = require('mongoose');

var topContributorSchema = new mongoose.Schema();

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
    countNodeActivity : {type:number},
    totalCount : {type:number}
});

var topContributorAgg = mongoose.model('topContributor', topContributorSchema);

module.exports = topContributorAgg;