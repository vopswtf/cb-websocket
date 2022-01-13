const ByteBuffer = require("bytebuffer");
const WebSocket = require("ws");
const playerManager = require('../../../playerManager/Player');
const serverMap = require('../../../playerManager/Server');

function run(b, ws) {
    var uuid = b.readVString();
    var server = b.readVString();
    var player = playerManager.playerMap.get(ws.playerId);

    player.server = server;
    player.save();

    player.friends.forEach(async friendId => {
        var friendPlayer = await playerManager.getPlayerDataByUUID(friendId);
        if (friendPlayer?.connected) {
            if (friendPlayer.friendStatus === "Offline") {
                return;
            }
            if (player.server === "") return send(player.uuid, "", friendPlayer.conn)
            let serverName = serverMap.get(server) || "A Private Server"
            send(player.uuid, serverName, friendPlayer.conn)
        }
    })
};

function send(uuid, server, ws) {
    var bb = new ByteBuffer()
    
    bb.writeVarint32(6)

    bb.writeVString(uuid)
    bb.writeVString(server)

    bb.flip()
        
    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

module.exports = {
    run,
    send
}