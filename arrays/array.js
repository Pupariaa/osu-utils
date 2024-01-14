function parseKeyValuePair(line) {
    const keyValueArray = line.split(':');
    if (keyValueArray.length === 2) {
        const [key, value] = keyValueArray;
        return { key: key.trim(), value: value.trim() };
    } else {
        console.error(`Ligne invalide: ${line}`);
        return { key: null, value: null };
    }
}

module.exports = parseKeyValuePair;