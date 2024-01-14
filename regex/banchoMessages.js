const regexJoined = /(.+)\s+joined\s+in\s+slot\s+(\d+)\./i;
const regexMoved = /(.+)\s+moved\s+to\s+slot\s+(\d+)/i;
const regexLeft = /(.+)\s+left the game.$/i;
const regexChangeMap = /(?:Changed beatmap to|Beatmap changed to:)\s*([^(\s]*)/i;

module.exports = {
    regexChangeMap,
    regexJoined,
    regexLeft,
    regexMoved
}