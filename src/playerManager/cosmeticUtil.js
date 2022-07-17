const fs = require('fs');
const cosmeticIndex = fs.readFileSync(process.cwd() + '/index.txt').toString().split('\n');
const indexSize = cosmeticIndex.length;

let cosmeticList = []

cosmeticIndex.forEach(cosmetic => {
    let values = cosmetic.split(',')
    if (!values[5]) return;
    cosmeticList.push({
        id: parseInt(values[0]),
        scale: parseFloat(values[1]),
        resourceLocation: values[2],
        name: values[3],
        type: values[4],
        animated: values[5]
    })
})

module.exports = {
    indexSize,
    cosmeticList
};
