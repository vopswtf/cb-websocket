const ByteBuffer = require("bytebuffer");

exports.run = (b, ws) => {
    return;
};

exports.send = (name, ip, ws) => {
    var bb = new ByteBuffer(256).flip()
    bb.writeVarint32(41)

    bb.writeVString(name)
    bb.writeVString(ip)
    
    bb.flip()
    
    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};