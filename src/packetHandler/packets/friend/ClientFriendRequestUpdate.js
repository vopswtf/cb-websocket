const ByteBuffer = require("bytebuffer");
const playerManager = require('../../../playerManager/Player');
const formattedConsole = require('../FormattedConsoleOutput');

function removeEachOther(expectedAccepter, expectedAddedOrDenied) {
    expectedAccepter.recievedFriendRequests = expectedAccepter.recievedFriendRequests.filter(function(el){
        return el.uuid !== expectedAddedOrDenied.uuid;
    });

    expectedAddedOrDenied.sentFriendRequests = expectedAddedOrDenied.sentFriendRequests.filter(function(el){
        return el.uuid !== expectedAccepter.uuid;
    });

    expectedAccepter.sentFriendRequests = expectedAccepter.sentFriendRequests.filter(function(el){
        return el.uuid !== expectedAddedOrDenied.uuid;
    });

    expectedAddedOrDenied.recievedFriendRequests = expectedAddedOrDenied.recievedFriendRequests.filter(function(el){
        return el.uuid !== expectedAccepter.uuid;
    });
}

async function run(b, ws) {
    var added = (b.readByte().toString() === "1" ? true : false);
    var uuid = b.readVString();

    var expectedAccepter = playerManager.playerMap.get(ws.playerId);
    var expectedAddedOrDenied = await playerManager.getPlayerDataByUUID(uuid);

    if (!expectedAddedOrDenied) return formattedConsole.send("Friend Request", "User not found!", ws);

    let isRealRequest = expectedAccepter.recievedFriendRequests.some(player => player.uuid === uuid);
    let isRealRequestButSecond = expectedAccepter.sentFriendRequests.some(player => player.uuid === uuid);
    if (isRealRequest === false && isRealRequestButSecond === false) return formattedConsole.send("Friend Request", "That request doesn't seem right.", ws);

    removeEachOther(expectedAccepter, expectedAddedOrDenied)

    if (expectedAddedOrDenied.connected) {
        send(expectedAccepter.uuid, false, expectedAddedOrDenied.conn)
    }

    if (added) {
        expectedAccepter.friends.push(expectedAddedOrDenied.uuid)
        expectedAddedOrDenied.friends.push(expectedAccepter.uuid)

        require('./FriendsUpdate').send(ws)

        if (expectedAddedOrDenied.connected) {
            formattedConsole.send("Friend Request", expectedAccepter.username + " has accepted your friend request!", expectedAddedOrDenied.conn);
            require('./FriendsUpdate').send(expectedAddedOrDenied.conn)
        }
    }

    expectedAccepter.save();
    expectedAddedOrDenied.save();

};

function send(uuid, added, ws) {
    var bb = new ByteBuffer(1024)

    bb.writeVarint32(21)

    if (added === true) {
        bb.writeByte(1)
    } else {
        bb.writeByte(0)
    }

    bb.writeVString(uuid)

    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

module.exports = {
    run,
    send
}
