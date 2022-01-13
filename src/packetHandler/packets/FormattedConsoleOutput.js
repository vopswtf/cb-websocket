const ByteBuffer = require("bytebuffer");

function run(b, ws) {
    return null;
};

function send(title, message, ws) {
    var bb = new ByteBuffer(256).flip()
    bb.writeVarint32(3)
    bb.writeVString(title)
    bb.writeVString(message).flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

module.exports = {
    run,
    send
}