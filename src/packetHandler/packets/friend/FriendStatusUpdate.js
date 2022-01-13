const ByteBuffer = require("bytebuffer");
const playerManager = require('../../../playerManager/Player');
const formattedConsole = require('../FormattedConsoleOutput');

async function run(b, ws) {
};

function send(uuid, username, paramBoolean, ws) {
    var bb = new ByteBuffer(1024)

    bb.writeVarint32(16)
    bb.writeVString(uuid)
    bb.writeVString(username)

    if (paramBoolean === true) {
        bb.writeByte(1)
    } else {
        bb.writeByte(0)
    }

    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

module.exports = {
    run,
    send
}