const ByteBuffer = require("bytebuffer");
const cosmeticUtil = require('../../playerManager/cosmeticUtil')
const playerManager = require("../../playerManager/Player")

function run(b, ws) {
    var inAmount = b.readInt();
    var player = playerManager.playerMap.get(ws.playerId)
    player.cosmetics = [];
    for (var i = 0; i < inAmount; i++) {
        var time = b.readLong()
        var enabled = (b.readByte().toString() === "1")
        var type = b.readVString()
        var name = b.readVString();
        var scale = b.readFloat();
        var resourceLocation = b.readVString();
        if (enabled) {
            cosmeticUtil.cosmeticList.forEach(cosmetic => {
                if (cosmetic.name === name) {
                    player.cosmetics.push(cosmetic.id)
                } 
            })
        }
    }
    
    player.save();

    playerManager.playerMap.forEach(p => {
        if (p.uuid !== player.uuid) {
            require("./Cosmetics").send(ws.playerId, player.cosmetics, p.conn)
        }
    })
};

function send(ws) {
};

module.exports = {
    send,
    run
}