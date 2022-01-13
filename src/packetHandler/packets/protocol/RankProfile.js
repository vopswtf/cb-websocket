const ByteBuffer = require("bytebuffer");
const playerManager = require("../../../playerManager/Player")

exports.run = (b, ws) => {
    var uuid = b.readVString();
    var player = playerManager.playerMap.get(uuid)

    if (player) {
        let rank = playerManager.rankMap.get(player.rank);
        this.send(uuid, rank.name, rank.origColor, rank.resourceLocation, ws)
    }
};

exports.send = (uuid, name, color, resourceLocation, ws) => {
    var bb = new ByteBuffer(256)
    bb.writeVarint32(69)
    bb.writeVString(uuid)
    bb.writeVString(name)
    bb.writeVString(name)
    bb.writeVString(color)
    bb.writeVString(resourceLocation)
    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

