const ByteBuffer = require("bytebuffer");
const playerManager = require('../../playerManager/Player');
const formattedConsole = require('./FormattedConsoleOutput');


async function run(b, ws) {
    let inAmount = b.readInt()
    let message = b.readVString();

    var player = playerManager.playerMap.get(ws.playerId)
    
    require('./Console').send(message, player.conn.requestingUser)

};

function send(uuid, message, ws) {
};

module.exports = {
    run,
    send
}