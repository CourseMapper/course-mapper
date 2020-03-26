var mongoose = require('mongoose');

// Define our client schema
var ClientSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
    clientId: {type: String, required: true},
    clientSecret: {type: String, required: true},
    description: {type: String, required: true},
    callbackUrl: {type: String},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users'}
}, {
    usePushEach: true
});

// Export the Mongoose model
module.exports = mongoose.model('OauthClients', ClientSchema);