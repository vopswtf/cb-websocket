const ByteBuffer = require("bytebuffer");
const cosmeticUtil = require('../../playerManager/cosmeticUtil')

function run(b, ws) {
    var uuid = b.readVString();

    require("./Cosmetics").send(uuid, null, ws)
};

function send(uuid, ws) {
};

module.exports = {
    send,
    run
}