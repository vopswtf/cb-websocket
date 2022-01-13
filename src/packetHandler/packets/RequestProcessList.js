const ByteBuffer = require("bytebuffer");
const playerManager = require('../../playerManager/Player');
const formattedConsole = require('./FormattedConsoleOutput');


async function run(b, ws) {
};

function send(ws) {
    var bb = new ByteBuffer()
    
    bb.writeVarint32(35)

    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

module.exports = {
    run,
    send
}