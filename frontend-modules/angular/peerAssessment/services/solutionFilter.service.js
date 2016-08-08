app.service('SolutionFilterService', function() {
    console.log('SolutionFilterService')
    var peerReview = ''

    return {
        getPeerReview: function() {
            return peerReview
        },

        setPeerReview: function(pR) {
            peerReview = pR
        }
    }
})