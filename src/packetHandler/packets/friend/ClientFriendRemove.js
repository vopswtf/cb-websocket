const ByteBuffer = require("bytebuffer");
const playerManager = require("../../../playerManager/Player");
const formattedConsole = require("../FormattedConsoleOutput");

async function run(b, ws) {
    var uuid = b.readVString();

    var remover = playerManager.playerMap.get(ws.playerId);
    var removed = await playerManager.getPlayerDataByUUID(uuid);

    remover.friends = remover.friends.filter((v) => v !== removed.uuid);
    removed.friends = removed.friends.filter((v) => v !== remover.uuid);

    remover.save();
    removed.save();

    require("./FriendsUpdate").send(ws);

    if (removed.connected) {
        send(remover.uuid, removed.conn);
    }

    send(removed.uuid, ws);

    if (removed.connected) {
        require("./FriendsUpdate").send(removed.conn);
    }
}

function send(uuid, ws) {
    var bb = new ByteBuffer(1024);

    bb.writeVarint32(17);

    bb.writeVString(uuid);

    bb.flip();

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
}

module.exports = {
    run,
    send,
};
