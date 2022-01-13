const ByteBuffer = require("bytebuffer");
const playerManager = require('../../../playerManager/Player');
const formattedConsole = require('../FormattedConsoleOutput');
const friendStatusUpdate = require('./FriendStatusUpdate');
const friendRequestRemove = require('./ClientFriendRemove')

async function run(b, ws) {
    var uuid = b.readVString();
    var username = b.readVString();

    var senderPlayer = playerManager.playerMap.get(ws.playerId);
    var targetPlayer = await playerManager.getPlayerData(username);
    
    if (!targetPlayer) {
        return formattedConsole.send("Friend Request", "User not found!", ws)
    } else if (senderPlayer.sentFriendRequests.some(player => player.uuid === targetPlayer.uuid)) {
        return formattedConsole.send("Friend Request", "You already have an outgoing friend request for that user!", ws)
    } else if (senderPlayer.recievedFriendRequests.some(player => player.uuid === targetPlayer.uuid)) {
        return formattedConsole.send("Friend Request", "That user has already sent you a friend request!", ws)
    } else if (senderPlayer.uuid === targetPlayer.uuid) {
        return formattedConsole.send("Friend Request", "You can't friend yourself!", ws)
    } else if (senderPlayer.friends.includes(targetPlayer.uuid)) {
        return formattedConsole.send("Friend Request", "That user is already your friend!", ws)
    } else if (!targetPlayer.acceptingFriends) {
        return formattedConsole.send("Friend Request", "That user isn't accepting friend requests!", ws)
    }
    
    friendRequestRemove.send(targetPlayer.uuid, ws)
    friendStatusUpdate.send(targetPlayer.uuid, targetPlayer.username, true, ws)

    senderPlayer.sentFriendRequests.push({ name: targetPlayer.username, uuid: targetPlayer.uuid })
    targetPlayer.recievedFriendRequests.push({ name: senderPlayer.username, uuid: senderPlayer.uuid })

    if (targetPlayer.connected) {
        friendRequestRemove.send(senderPlayer.uuid, targetPlayer.conn)
        send(senderPlayer.uuid, senderPlayer.username, targetPlayer.conn)
    }

    senderPlayer.save();
    targetPlayer.save();
};

function send(uuid, username, ws) {
    var bb = new ByteBuffer(1024)

    bb.writeVarint32(9)
    bb.writeVString(uuid)
    bb.writeVString(username)

    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

module.exports = {
    run,
    send
}