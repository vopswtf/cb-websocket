const { WebSocketServer } = require('ws'),
ByteBuffer = require('bytebuffer'),
fetch = require('node-fetch');

const packets = require("./packetHandler/packets")
const playerManager = require("./playerManager/Player")
const serverManager = require("./playerManager/Server")
const config = require('../config.json')

async function collectServers() {
    const serversRes = await fetch('https://servermappings.lunarclientcdn.com/servers.json');
    const servers = await serversRes.json();
    servers.forEach(obj => {
        obj.addresses.forEach(address => {
            serverManager.set(address, obj.name);      
        })
    })
}

collectServers();

Object.keys(packets).forEach(id => {
    var packetName = packets[id];
    try {
        require("./packetHandler/packets/" + packetName)
    } catch(err) {
        console.log(err)
        console.log(packetName + " doesn't exist!")
    }
})

const wss = new WebSocketServer({ port: config.websocketPort });

wss.on('connection', async function connection(ws, req) {
    ws.send("You have connected to the Vopsocket.")
    var username = req.headers['username'];
    var uuid = req.headers['playerid'];
    var version = req.headers['version'];
    if (!username || !uuid || !version) {
        ws.close();
        return;
    }

    ws.playerId = uuid;

    await playerManager.getOrCreatePlayer(ws, req.headers, username)

    ws.on('message', function(message) {
        const b = new ByteBuffer.wrap(message);
        let packetId = b.readVarint32();
        let packetName = packets[packetId];

        if (packetName) {
            try {
                let packetFunction = require("./packetHandler/packets/" + packetName)
                packetFunction.run(b, ws, message)
            } catch(err) {
                if (err.message.includes("Cannot find")) return;
                console.log(err)
            }
        }
    });

    ws.on('close', () => {
        var player = playerManager.playerMap.get(ws.playerId);
        var rank = player.getRank();
        if (player) {
            player.logOffTime = Date.now();
            player.connected = false;
            player.server = "";

            player.friends.forEach(async friendId => {
                var friendPlayer = await playerManager.getPlayerDataByUUID(friendId);
                if (friendPlayer.friendStatus !== "Offline" && friendPlayer.connected) {
                    require("./packetHandler/packets/friend/FriendUpdate").send(player.uuid, rank.color + player.username, player.logOffTime, false, friendPlayer.conn)
                }
            })

            player.save();
            playerManager.playerMap.delete(ws.playerId);
            console.log(`[LOG] ${player.username} has disconnected.`)
        }
    })
});
  
process.on('SIGINT', signal => {
    console.log(`[LOG] Server has been interrupted. Saving player data...`)
    var size = playerManager.playerMap.size;
    
    playerManager.playerMap.forEach(player => {
        player.conn.close();
    })

    setTimeout(() => {
        console.log("[LOG] Saved player data for " + size + " players.")
        process.exit(0)
    }, size * 400)
})