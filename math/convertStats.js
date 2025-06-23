"use strict";

/**
 * Applies Hard Rock (HR) multiplier to a value with an optional maximum cap.
 *
 * @param {number} value - Original value (e.g. CS, AR, OD, HP).
 * @param {number} factor - Multiplication factor (e.g. 1.3 or 1.4).
 * @param {number} [cap=10] - Maximum allowed value.
 * @returns {number} - Modified value after HR adjustment, capped if needed.
 */
function applyHR(value, factor, cap = 10) {
    return Math.min(value * factor, cap);
}

/**
 * Applies Easy (EZ) mod reduction to a given value.
 *
 * @param {number} value - Original value (e.g. CS, AR, OD, HP).
 * @param {number} [factor=0.5] - Reduction factor, default is 50%.
 * @returns {number} - Reduced value.
 */
function applyEZ(value, factor = 0.5) {
    return value * factor;
}

/**
 * Converts AR (Approach Rate) into milliseconds.
 *
 * @param {number} ar - AR value (0 to ~11).
 * @returns {number} - Time in milliseconds (ms) it takes for the approach circle to fully shrink.
 */
function arToMs(ar) {
    return ar < 5 ? 1800 - 120 * ar : 1200 - 150 * (ar - 5);
}

/**
 * Converts a time in milliseconds back into AR (Approach Rate).
 *
 * @param {number} ms - Approach time in milliseconds.
 * @returns {number} - AR value equivalent.
 */
function msToAr(ms) {
    return ms > 1200 ? (1800 - ms) / 120 : 5 + (1200 - ms) / 150;
}

/**
 * Multiplies BPM based on clock speed changes (e.g. DT, HT).
 *
 * @param {number} bpm - Base BPM.
 * @param {number} multiplier - Clock rate multiplier (e.g. 1.5 for DT, 0.75 for HT).
 * @returns {number} - Modified BPM.
 */
function applyBpmMultiplier(bpm, multiplier) {
    return bpm * multiplier;
}

/**
 * Adjusts the total map length based on clock speed changes.
 *
 * @param {number} length - Original map duration in milliseconds.
 * @param {number} multiplier - Clock rate multiplier.
 * @returns {number} - Modified duration in milliseconds.
 */
function applyLengthMultiplier(length, multiplier) {
    return length / multiplier;
}

module.exports = {
    applyHR,
    applyEZ,
    arToMs,
    msToAr,
    applyBpmMultiplier,
    applyLengthMultiplier
};
