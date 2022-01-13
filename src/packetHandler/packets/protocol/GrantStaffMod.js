const ByteBuffer = require("bytebuffer");

exports.run = (b, ws) => {
    // protocol cb can write this packet but why when u have ranksss!!!
    return;
};

exports.send = (bool, ws) => {
    var bb = new ByteBuffer(256).flip()
    bb.writeVarint32(43)
    
    // lol herobrine uuid
    bb.writeVString("f84c6a79-0a4e-45e0-879b-cd49ebd4c4e2")
    bb.writeVString(ws.playerId)

    bb.writeByte((bool ? 1 : 0))
    
    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};