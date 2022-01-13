const ByteBuffer = require("bytebuffer");
const playerManager = require('../../playerManager/Player');
const rankMap = require('../../playerManager/Rank')
const serverMap = require('../../playerManager/Server');
const config = require('../../../config.json')

function run(b, ws) {
    var message = b.readVString().split(" ");
    var cmd = message.shift();
    handleCommand(cmd.toLowerCase(), message, ws);
};

function send(message, ws) {
    var bb = new ByteBuffer(256)
    bb.writeVarint32(2)
    bb.writeVString(message)
    bb.flip()

    let finalBuffer = bb.buffer;
    ws.send(finalBuffer);
};

async function handleCommand(cmd, args, ws) {
    if (cmd === "help") {
        if (!ws.isAdmin) {
            send("§e---------------   §fHelp   §e---------------", ws)
            send("§6online§7: §fShows the amount of online users", ws)
            send("§6login <password>§7: §fAccess the administration console", ws)
            send("§e---------------------------------------", ws)
        } else {
            send("§e---------------   §fHelp   §e---------------", ws)
            send("§6online§7: §fShows the amount of online users", ws)
            send("§6info <username>§7: §fShow information about a player", ws)
            send("§6givestaff <username>§7: §fGive a player staff modules", ws)
            send("§6takestaff <username>§7: §fRemoves a players staff modules", ws)
            send("§6announce <announcement>§7: §fSend a notification to all players", ws)
            send("§6processes <username>§7: §fLists players current processes", ws)
            send("§6listranks§7: §fLists current ranks", ws)
            send("§6setrank <username> <rankId>§7: §fSet players rank", ws)
            send("§e---------------------------------------", ws)
        }
        return;
    }

    if (cmd === "online") {
        if (args[0] && args[0].toLowerCase() === "listall") {
            send("§e---------------   §fPlayers   §e---------------", ws)
            playerManager.playerMap.forEach(player => {
                let serverName = serverMap.get(player.server) || "A Private Server"
                if (player.server !== "") {
                    send(`§6${player.username}§7: §f` + serverName, ws)
                } else {
                    send(`§6${player.username}§7: §fOnline`, ws)
                }
            })
            return send("§e-----------------------------------------", ws)
        }

        send(`§aType "online listall" to view the full list!`, ws);
        return send("§aPlayers Online: " + playerManager.playerMap.size, ws);
    }

    if (cmd === "login") {
        if (ws.isAdmin) return send(`§cYour connection has already been granted administrative commands.`, ws)
        if (args[0]) {
            if (config.consolePasswords.includes(args.join(" "))) {
                const player = playerManager.playerMap.get(ws.playerId)
                ws.isAdmin = true;
                send("§aYou have logged in to the administrator console.", ws)
                send(`§aType "help" to see your new commands.`, ws)
                console.log(`[LOG] ${player.username} has logged into the admin console.`)
            } else {
                send(`§cIncorrect password!`, ws)
            }
        } else {
            send("§6login <password>§7: §fAccess the administration console", ws)
        }
        return;
    }

    if (cmd === "processes") {
        if (ws.isAdmin) {
            if (args[0]) {
                var player = await playerManager.getPlayerData(args[0]);
                if (!player) return send('Player not found.', ws)
                player.conn.requestingUser = ws;
            } else {
                send("§6processes <username>§7: §fLists players current processes", ws)
            }
            return;
        }
    }

    if (cmd === "givestaff") {
        if (ws.isAdmin) {
            if (args[0]) {
                var player = await playerManager.getPlayerData(args[0]);
                if (!player && !player.connected) return send('Player not found or not connected.', ws)
                require('./protocol/GrantStaffMod').send(true, player.conn)
            } else {
                send("§6givestaff <username>§7: §fGive a player staff modules", ws)
            }
            return;
        }
    }

    if (cmd === "takestaff") {
        if (ws.isAdmin) {
            if (args[0]) {
                var player = await playerManager.getPlayerData(args[0]);
                if (!player && !player.connected) return send('Player not found or not connected.', ws)
                require('./protocol/GrantStaffMod').send(false, player.conn)
            } else {
                send("§6takestaff <username>§7: §fRemoves a players staff modules", ws)
            }
            return;
        }
    }

    if (cmd === "listranks") {
        if (ws.isAdmin) {
            send("§e---------------   §fRanks   §e---------------", ws)
            config.ranks.forEach((rank, i) => {
                send(`§6Rank§7: ${rank.color}${rank.name}`, ws)
                send(`§6ID§7: §f${rank.id}`, ws)
                send(`§6Nametag Location§7: §f${rank.resourceLocation || "Default"}`, ws)
                send(`§6Friend Image§7: §f${rank.friendRankImage || "Default"}`, ws)
                send("§e------------------------------------------", ws);
            })
            return;
        }
    }

    if (cmd === "announce") {
        if (ws.isAdmin) {
            if (args[0]) {
                playerManager.playerMap.forEach(player => {
                    require('./FormattedConsoleOutput').send("Announcement", args.join(" ").replaceAll("&", "§"), player.conn)
                })
            } else {
                send("§6announce <announcement>§7: §fSend a notification to all players", ws)
            }
            return;
        }
    }

    if (cmd === "info") {
        if (ws.isAdmin) {
            if (args[0]) {
                var player = await playerManager.getPlayerData(args[0]);
                if (!player) return send("§cPlayer not found.", ws)
                send("§e---------------   §fInfo   §e---------------", ws)
                send(`§6Username§7: §f${player.username}`, ws)
                send(`§6UUID§7: §f${player.uuid}`, ws)
                send(`§6Rank§7: §f${player.getRank().origColor}${player.getRank().name}`, ws)
                if (player.connected) {
                    if (player.server !== "") {
                        send(`§6Server§7: §f${player.server}`, ws)
                    }
                    send(`§6Status§7: §f${player.friendStatus}`, ws)
                } else {
                    send(`§6Last Online§7: §f${new Date(player.logOffTime * 1e3).toDateString()}`, ws)
                }
                send(`§6Friends§7: §f${player.friends.length}`, ws)
                send(`§6Accepting Requests§7: §f${(player.acceptingFriends ? "Yes" : "No")}`, ws)
                send("§e---------------------------------------", ws)
            } else {
                send("§6info <username>§7: §fShow information about a player", ws)
            }
            return;
        }
    }


    if (cmd === "setrank") {
        if (ws.isAdmin) {
            if (args[0]) {
                var player = await playerManager.getPlayerData(args[0]);
                if (!player) return send('Player not found.', ws)
                let rank = rankMap.get(parseInt(args[1]))
                if (!rank) return send('Rank not found.', ws)
                player.rank = parseInt(args[1]);
                player.save();
                send(player.username + " has been given " + rank.color + rank.name + "§f rank!", ws)
                player.friends.forEach(async friendId => {
                    var friendPlayer = await playerManager.getPlayerDataByUUID(friendId);
                    if (friendPlayer?.connected) {
                        require("./friend/FriendUpdate").send(player.uuid, rank.color + player.username, player.statusToInt(player.friendStatus), true, friendPlayer.conn)
                    }
                })
            } else {
                send("§6setrank <username> <rankId>§7: §fSet players rank", ws)
            }
            return;
        }
    }

    send(`Unknown command. Type "help" for help.`, ws);
}

module.exports = {
    run,
    send
}