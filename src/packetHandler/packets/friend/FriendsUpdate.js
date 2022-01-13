const ByteBuffer = require("bytebuffer");
const playerManager = require('../../../playerManager/Player');
const formattedConsole = require('../FormattedConsoleOutput');
const serverMap = require('../../../playerManager/Server');

async function run(b, ws) {
};

function send(ws) {
    const player = playerManager.playerMap.get(ws.playerId);
    var onlineFriends = [];
    var offlineFriends = [];
    var bb = new ByteBuffer()
    
    bb.writeVarint32(4)
    
    bb.writeByte(1);
    if (player.acceptingFriends) {
        bb.writeByte(1)
    } else {
        bb.writeByte(0)
    }

    player.friends.forEach(async (friendId, i) => {
        var friendPlayer = await playerManager.getPlayerDataByUUID(friendId);
        var friendRank = friendPlayer.getRank();
        if (friendPlayer?.connected && friendPlayer.friendStatus !== "Offline") {
            onlineFriends.push(friendPlayer)
        } else {
            offlineFriends.push(friendPlayer)
        }

        if (i === player.friends.length - 1) {
            bb.writeInt(onlineFriends.length)
            bb.writeInt(offlineFriends.length)
        
            onlineFriends.forEach(async friend => {
                bb.writeVString(friend.uuid)
                bb.writeVString(friendRank.color + friend.username)
                bb.writeInt(player.statusToInt(friend.friendStatus))
                if (friend.server === "") {
                    bb.writeVString("")
                } else {
                    let serverName = serverMap.get(friend.server) || "A Private Server"
                    bb.writeVString(serverName)
                }
            })
        
            offlineFriends.forEach(async friend => {
                bb.writeVString(friend.uuid)
                bb.writeVString(friendRank.color + friend.username)
                bb.writeLong(friend.logOffTime)
            })
        
            bb.flip()
        
            let finalBuffer = bb.buffer;
            ws.send(finalBuffer);
        }
    })
};

module.exports = {
    run,
    send
}