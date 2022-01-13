const ByteBuffer = require("bytebuffer");
const playerManager = require('../../../playerManager/Player');

exports.run = (b, ws) => {
    var accepting = (b.readByte().toString() === "1" ? true : false);
    var player = playerManager.playerMap.get(ws.playerId)
    
    player.acceptingFriends = accepting;

    player.save();
};

exports.send = (uuid, ws) => {
};