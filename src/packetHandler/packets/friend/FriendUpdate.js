const ByteBuffer = require("bytebuffer");
const playerManager = require('../../../playerManager/Player');
const formattedConsole = require('../FormattedConsoleOutput');


async function run(b, ws) {
    const player = playerManager.playerMap.get(ws.playerId);
    var rank = player.getRank();

    b.readVString()
    b.readVString()
    var onlineStatusOrOffline = player.intToStatus(b.readLong().low);
    var online = (b.readByte().toString() == "1") ? true : false;

    if (onlineStatusOrOffline) {
        if (onlineStatusOrOffline === "Offline") {
            player.logOffTime = Date.now()
        }
        player.friendStatus = onlineStatusOrOffline;
        player.save()
    }

    player.friends.forEach(async friendId => {
        var friendPlayer = await playerManager.getPlayerDataByUUID(friendId);
        if (friendPlayer?.connected) {
            if (onlineStatusOrOffline === "Offline") {
                require("./FriendUpdate").send(player.uuid, rank.color + player.username, player.logOffTime, false, friendPlayer.conn)
                return;
            }
            require("./FriendUpdate").send(player.uuid, rank.color + player.username, player.statusToInt(onlineStatusOrOffline), true, friendPlayer.conn)
        }
    })
};

function send(uuid, username, onlineStatusOrOffline, online, ws) {
    var bb = new ByteBuffer(1024)

    bb.writeVarint32(18)

    bb.writeVString(uuid)
    bb.writeVString(username)
    bb.writeLong(onlineStatusOrOffline)
    if (online) {
        bb.writeByte(1)
    } else {
        bb.writeByte(0)
    }

    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

module.exports = {
    run,
    send
}