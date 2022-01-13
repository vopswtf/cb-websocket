const ByteBuffer = require("bytebuffer");
const cosmeticUtil = require('../../playerManager/cosmeticUtil')

function run(b, ws) {
    var crashId = b.readVString();
    var version = b.readVString();
    var osInfo = b.readVString();
    var memoryInfo = b.readVString();
    var stackTrace = b.readVString();

    ws.close();
    
    // you can do whatever u want with this shit
    // ill probably make it go into a discord webhook or something
};

function send(uuid, ws) {
};

module.exports = {
    send,
    run
}