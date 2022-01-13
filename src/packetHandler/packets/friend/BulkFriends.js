const ByteBuffer = require("bytebuffer");
const playerManager = require('../../../playerManager/Player');

exports.run = (b, ws) => {
};

exports.send = (ws) => {
    const player = playerManager.playerMap.get(ws.playerId);

    var bb = new ByteBuffer()

    bb.writeVarint32(7)

    bb.writeVString(JSON.stringify({bulk: player.recievedFriendRequests}))

    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};