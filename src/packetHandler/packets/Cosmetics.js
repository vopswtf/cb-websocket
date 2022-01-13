const ByteBuffer = require("bytebuffer");
const cosmeticUtil = require('../../playerManager/cosmeticUtil')
const playerManager = require("../../playerManager/Player")

function run(b, ws) {
    return null;
};

function send(uuid, list, ws) {
    var bb = new ByteBuffer()
    var player = playerManager.playerMap.get(uuid)
    if (!player) return;
    var cosmeticList;
    if (!list) {
        cosmeticList = player.cosmetics;
    } else {
        cosmeticList = list;
    }

    bb.writeVarint32(8)
    bb.writeVString(uuid)
    bb.writeInt(cosmeticUtil.indexSize)

    cosmeticUtil.cosmeticList.forEach(cosmetic => {
        bb.writeLong(1)
        bb.writeFloat(cosmetic.scale)
        bb.writeByte((cosmeticList.includes(cosmetic.id) ? 1 : 0))
        bb.writeVString(cosmetic.resourceLocation)
        bb.writeVString(cosmetic.name)
        bb.writeVString(cosmetic.type)
    })

    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

module.exports = {
    send,
    run
}