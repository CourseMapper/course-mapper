var mongoose = require('mongoose');

// Define our token schema
var TokenSchema = new mongoose.Schema({
    token: {type: String, required: true},
    clientId: {type: String, required: true},
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
}, {
    usePushEach: true
});

// Export the Mongoose model
module.exports = mongoose.model('AccessTokens', TokenSchema);