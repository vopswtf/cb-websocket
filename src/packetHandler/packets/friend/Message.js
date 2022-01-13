const ByteBuffer = require("bytebuffer");
const playerManager = require('../../../playerManager/Player');
const formattedConsole = require('../FormattedConsoleOutput');


async function run(b, ws) {
    const messageSender = playerManager.playerMap.get(ws.playerId);
    const messageReciever = await playerManager.getPlayerDataByUUID(b.readVString());
    const message = b.readVString();

    if (messageReciever.connected) {
        send(messageSender.uuid, message, messageReciever.conn)
    }
};

function send(uuid, message, ws) {
    var bb = new ByteBuffer()
    
    bb.writeVarint32(5)
    
    bb.writeVString(uuid)
    bb.writeVString(message)

    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

module.exports = {
    run,
    send
}