/**
 * Calculate performance rating for standard game modes (0, 1, 2, and 3).
 *
 * @param {number} pAcc - Player's acc.
 * @param {number} h3 - Number of 300s.
 * @param {number} h1 - Number of 100s.
 * @param {number} h5 - Number of 50s.
 * @param {number} h0 - Number of misses.
 * @param {string} mds - Modifiers.
 * @returns {string} - Performance rating.
 * @returns {number} - Boat, averge note stacked of 50 percent 1.
 * @private
 */
function calculateNoteStandard(pAcc, h3, h1, h5, h0, mds){
    let th = h3 + h1 + h5 + h0;
    let boat = (h5 / th) * 100;

    if (pAcc === 100) {
        return mds ? 'SSH' : 'SS';
    } else if (pAcc > 90 && boat <= 1 && h0 === 0) {
        return mds ? 'SH' : 'S';
    } else if ((pAcc > 80 && h0 === 0) || pAcc > 90) {
        return 'A';
    } else if ((pAcc > 70 && h0 === 0) || pAcc > 80) {
        return 'B';
    } else if (pAcc > 60) {
        return 'C';
    } else {
        return 'D';
    }
}
/**
 * Calculate performance rating for Taiko mode (1).
 *
 * @param {number} pAcc - Player's acc.
 * @returns {string} - Performance rating.
 * @private
 */
function calculateNoteTaiko(pAcc){
    if (pAcc === 100) {
        return 'SSH';
    } else if (pAcc > 98 && pAcc <= 99.99) {
        return 'SH';
    } else if (pAcc > 94.01 && pAcc <= 98) {
        return 'A';
    } else if (pAcc > 90.01 && pAcc <= 94) {
        return 'B';
    } else if (pAcc > 85.01 && pAcc <= 90) {
        return 'C';
    } else {
        return 'D';
    }
}
/**
 * Calculate performance rating for Catch the Beat mode (2).
 *
 * @param {number} pAcc - Player's acc.
 * @returns {string} - Performance rating.
 * @private
 */
function calculateNoteCTB(pAcc){
    return this.calculateNoteTaiko(pAcc);
}
/**
 * Calculate performance rating for Mania mode (3).
 *
 * @param {number} pAcc - Player's acc.
 * @param {string} mds - Modifiers.
 * @returns {string} - Performance rating.
 * @private
 */
function calculateNoteMania(pAcc, mds){
    if (pAcc === 100) {
        return mds ? 'SSH' : 'SS';
    } else if (pAcc > 95) {
        return mds ? 'SH' : 'S';
    } else if (pAcc > 90) {
        return 'A';
    } else if (pAcc > 80) {
        return 'B';
    } else if (pAcc > 70) {
        return 'C';
    } else {
        return 'D';
    }
}

module.exports = {
    calculateNoteStandard,
    calculateNoteTaiko,
    calculateNoteCTB,
    calculateNoteMania,
};