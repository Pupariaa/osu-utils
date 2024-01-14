function tsMs(ms) {
    try {
        const epochDiff = 11644473600000;
        const timestampUnix = (ms / 10000) - epochDiff;
        const date = new Date(timestampUnix);
        const adjustedYear = date.getUTCFullYear() - 1600;
        date.setUTCFullYear(adjustedYear);
        return date.toLocaleString();
    } catch (error) {
        console.error("Error in tsms function:", error);
        return "Invalid Date";
    }
}

module.exports = {
    tsMs
};