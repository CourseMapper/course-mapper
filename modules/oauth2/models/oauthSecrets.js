var mongoose = require('mongoose');

// Define our token schema
var OauthSchema = new mongoose.Schema({
    oauthSecret: {type: String, required: true},
    redirectUri: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users'},
    clientId: {type: String, required: true}
}, {
    usePushEach: true
});

// Export the Mongoose model
module.exports = mongoose.model('OauthSecrets', OauthSchema);
