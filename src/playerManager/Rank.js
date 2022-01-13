const rankMap = new Map();
const config = require('../../config.json')

const ranks = config.ranks;

ranks.forEach(rank => {
    let images = {
        "cheatbreaker": "§c",
        "highroller": "§5",
        "twitch": "§n§d",
        "youtube": "§d",
        "block": "§e",
        "logo": "§k"
    }
    rank.origColor = rank.color;
    if (images[rank.friendRankImage]) {
        rank.color = images[rank.friendRankImage] + rank.color
    }
    rankMap.set(rank.id, rank)
})

module.exports = rankMap;