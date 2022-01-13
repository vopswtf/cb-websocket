const ByteBuffer = require("bytebuffer");

exports.run = (b, ws) => {
    return;
};

exports.send = (server, message, ws) => {
    var bb = new ByteBuffer(256).flip()
    bb.writeVarint32(40)
    
    bb.writeVString(server)
    bb.writeVString(message)
    
    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};