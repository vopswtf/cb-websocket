const playerMap = new Map();
const rankMap = require('./Rank')
const mongoPlayer = require('./Mongo')
const config = require('../../config.json')

async function getOrCreatePlayer(conn, headers, username) {
    if (playerMap.has(headers.playerid)) {
        conn.send("Player is already on the websocket!")
        conn.close();
        return;
    }

    let playerModel = await mongoPlayer.findOne({_id: headers.playerid});
    
    if (!playerModel) {
        playerModel = new mongoPlayer({
            _id: headers.playerid,
            username: headers.username,
            server: headers.server || "",
            version: headers.version || "Unknown",
            rank: 0,
            cosmetics: [],
            friends: [],
            friendStatus: "Online",
            logOffTime: Date.now(),
            acceptingFriends: true,
            connected: true
        })
    }

    playerModel.connected = true;
    playerModel.username = headers.username;
    playerModel.server = headers.server || "";
    playerModel.version = headers.version || "Unknown";

    playerModel.save();

    const player = new Player(
        conn,
        playerModel._id,
        playerModel.username,
        playerModel.server,
        playerModel.version,
        playerModel.rank,
        playerModel.cosmetics,
        playerModel.friends,
        playerModel.logOffTime,
        playerModel.sentFriendRequests,
        playerModel.recievedFriendRequests,
        playerModel.friendStatus,
        playerModel.acceptingFriends,
        playerModel.connected
    );

    playerMap.set(playerModel._id, player)
    sendFirstPackets(player, headers, conn)
    console.log(`[LOG] ${player.username} has connected.`)
}

function sendFirstPackets(player, headers, conn) {
    var rank = player.getRank();

    require("../packetHandler/packets/Cosmetics").send(headers.playerid, null, conn)

    player.sentFriendRequests.forEach(async friend => {
        require("../packetHandler/packets/friend/FriendStatusUpdate").send(friend.uuid, friend.name, true, conn)
    })

    require("../packetHandler/packets/friend/FriendsUpdate").send(conn)

    setTimeout(() => {
        player.friends.forEach(async friendId => {
            var friendPlayer = await getPlayerDataByUUID(friendId);
            if (friendPlayer?.connected) {
                require("../packetHandler/packets/friend/FriendUpdate").send(player.uuid, rank.color + player.username, player.statusToInt(player.friendStatus), true, friendPlayer.conn)
            }
        })
    }, 1000)
    
    require("../packetHandler/packets/friend/BulkFriends").send(conn)

    require("../packetHandler/packets/FormattedConsoleOutput").send(config.welcomeNotification.title.replaceAll("&", "§"), config.welcomeNotification.message.replaceAll("&", "§"), conn)
    player.save();
}

async function getPlayerData(username) {
    let playerModel = await mongoPlayer.findOne({username: {$regex: username + '$', $options: 'i'}});
    
    if (!playerModel) return null;

    if (playerModel.connected) {
        let p = playerMap.get(playerModel._id)
        if (p) return p; else {
            playerModel.connected = false;
            playerModel.save();
        }
    }

    let p = new Player(
        null,
        playerModel._id,
        playerModel.username,
        playerModel.server,
        playerModel.version,
        playerModel.rank,
        playerModel.cosmetics,
        playerModel.friends,
        playerModel.logOffTime,
        playerModel.sentFriendRequests,
        playerModel.recievedFriendRequests,
        playerModel.friendStatus,
        playerModel.acceptingFriends,
        playerModel.connected
    )
    return p;
}

async function getPlayerDataByUUID(uuid) {
    let playerModel = await mongoPlayer.findOne({_id: uuid});
    
    if (!playerModel) return null;

    if (playerModel.connected) {
        let p = playerMap.get(playerModel._id)
        if (p) return p; else {
            playerModel.connected = false;
            playerModel.save();
        }
    }

    let p = new Player(
        null,
        playerModel._id,
        playerModel.username,
        playerModel.server,
        playerModel.version,
        playerModel.rank,
        playerModel.cosmetics,
        playerModel.friends,
        playerModel.logOffTime,
        playerModel.sentFriendRequests,
        playerModel.recievedFriendRequests,
        playerModel.friendStatus,
        playerModel.acceptingFriends,
        playerModel.connected
    )
    return p;
}

const Player = class {
    constructor(conn, uuid, username, server, version, rank, cosmetics, friends, logOffTime, sentFriendRequests, recievedFriendRequests, friendStatus, acceptingFriends, connected) {
        this.conn = conn;
        this.uuid = uuid;
        this.username = username;
        this.server = server;
        this.version = version;
        this.rank = rank;
        this.cosmetics = cosmetics;

        this.friends = friends;
        this.logOffTime = logOffTime;

        this.sentFriendRequests = sentFriendRequests;
        this.recievedFriendRequests = recievedFriendRequests;

        this.friendStatus = friendStatus;
        this.acceptingFriends = acceptingFriends;

        this.connected = connected;
    }

    async save() {
        let playerModel = await mongoPlayer.findOne({_id: this.uuid});
        if (!playerModel) return;
        playerModel.username = this.username;
        playerModel.server = this.server;
        playerModel.version = this.version;
        playerModel.rank = this.rank;
        playerModel.cosmetics = this.cosmetics;

        playerModel.friends = this.friends;
        playerModel.logOffTime = this.logOffTime;

        playerModel.sentFriendRequests = this.sentFriendRequests;
        playerModel.recievedFriendRequests = this.recievedFriendRequests;

        playerModel.friendStatus = this.friendStatus;
        playerModel.acceptingFriends = this.acceptingFriends;

        playerModel.connected = this.connected;
        playerModel.save();
    }

    getRank() {
        return rankMap.get(this.rank);
    }

    statusToInt(stri) {
        let friendStatusShit = {
            "Online": 0,
            "Away": 1,
            "Busy": 2,
            "Offline": 3
        }
        return friendStatusShit[stri];
    }
    intToStatus(int) {
        let friendStatusShit = {
            0: "Online",
            1: "Away",
            2: "Busy",
            3: "Offline"
        }
        return friendStatusShit[int];
    }
}

module.exports = {
    playerMap,
    rankMap,
    getPlayerData,
    getOrCreatePlayer,
    Player,
    getPlayerDataByUUID
}