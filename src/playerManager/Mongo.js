const mongoose = require('mongoose');
const config = require('../../config.json')

mongoose.connect(config.mongo.url, {useNewUrlParser: true});

const playerSchema = new mongoose.Schema({
    _id: String,
    username: String,
    server: String,
    version: String,
    rank: Number,
    cosmetics: Array,

    friends: Array,
    logOffTime: Number,

    sentFriendRequests: Array,
    recievedFriendRequests: Array,

    friendStatus: String,
    acceptingFriends: Boolean,
    
    connected: Boolean,
}, {
    collection: config.mongo.collection,
    versionKey: false
});

const mongoPlayer = mongoose.model("Player", playerSchema);

module.exports = mongoPlayer;