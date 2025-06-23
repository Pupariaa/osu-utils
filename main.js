"use strict";


const {
	calculateNoteStandard,
	calculateNoteTaiko,
	calculateNoteCTB,
	calculateNoteMania
} = require('./math/rank');
const {
	tsMs
} = require('./math/time');
const {
	CaStd,
	CaTaiko,
	CaCtb,
	CaMania
} = require('./math/accuracy');
const Mods = require('./arrays/mods');
const Modes = require('./arrays/modes');
const parseBm = require('./parser/bm_parser')
const fs = require('fs');

const {
	regexChangeMap,
	regexJoined,
	regexLeft,
	regexMoved
} = require('./regex/banchoMessages')

const {
	applyHR,
	applyEZ,
	arToMs,
	msToAr,
	applyBpmMultiplier,
	applyLengthMultiplier
} = require('./math/convertStats');


class OsuUtils {

	/**
	 * Calculate accuracy based on hits and mode.
	 *
	 * @param {number} m - Game mode (0 to 3).
	 * @param {number} h3 - Number of 300s.
	 * @param {number} h1 - Number of 100s.
	 * @param {number} h5 - Number of 50s.
	 * @param {number} h0 - Number of misses.
	 * @param {number} [k=0] - Number of katus (optional, default is 0).
	 * @param {number} [g=0] - Number of geki (optional, default is 0).
	 * @returns {string} - Calculated player acc.
	 * @throws {Error} - Throws an error for invalid game mode.
	 */
	CalcAccuracy(m, h3, h1, h5, h0, k = 0, g = 0) {
		try {
			if (m < 0 || m > 3) {
				throw new Error("Invalid game mode");
			}
			let acc;
			switch (m) {
				case 0:
					acc = CaStd(h3, h1, h5, h0);
					break;
				case 1:
					acc = CaTaiko(h3, h1, h0);
					break;
				case 2:
					acc = CaCtb(h3, h1, h5, k, h0);
					break;
				case 3:
					acc = CaMania(h3, h1, h5, g, k, h0);
					break;
			}

			return acc.toFixed(2);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Determine performance rating based on mode, player acc, and hits.
	 *
	 * @param {number} m - Game mode (0 to 3).
	 * @param {number} h3 - Number of 300s.
	 * @param {number} h1 - Number of 100s.
	 * @param {number} h5 - Number of 50s.
	 * @param {number} h0 - Number of misses.
	 * @param {string} [mds=null] - Modifiers (optional, default is null).
	 * @param {number} pAcc - Player's acc.
	 * @returns {string} - Performance rating.
	 */
	Rank(m, h3, h1, h5, h0, mds = null, pAcc) {
		try {
			switch (m) {
				case 0:
					return calculateNoteStandard(pAcc, h3, h1, h5, h0, mds);
				case 1:
					return calculateNoteTaiko(pAcc);
				case 2:
					return calculateNoteCTB(pAcc);
				case 3:
					return calculateNoteMania(pAcc, mds);
				default:
					throw new Error("Invalid game mode");
			}
		} catch (error) {
			throw error;
		}
	}
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

	/**
	 * Converts a timestamp in Microsoft FileTime format to a human-readable date string.
	 * @param {number} ms - Timestamp in Microsoft FileTime format.
	 * @returns {string} - Formatted date string.
	 */
	TimeStampToMs(ms) {
		return tsMs(ms);
	}

	/**
	 * Converts a numeric representation of mods to a space-separated string of mod names.
	 * @param {number} int - Numeric representation of mods.
	 * @returns {string} - Space-separated string of mod names.
	 */
	ModsIntToString(int) {
		try {
			const modNames = [];
			for (let mod in Mods) {
				if (int & Mods[mod]) {
					modNames.push(mod);
				}
			}
			return modNames.join(" ");
		} catch (error) {
			console.error("Error in ModsIntToString function:", error);
			return "Error converting mods";
		}
	}

	/**
	 * Converts a mode string to its corresponding numeric representation.
	 * @param {string} modeString - Mode string ('osu', 'taiko', 'ctb', 'mania').
	 * @returns {number} - Numeric representation of the mode.
	 */

	ModeStringToInt(modeString) {
		try {
			const modeKey = modeString.toLowerCase();
			return Modes.hasOwnProperty(modeKey) ? Modes[modeKey] : -1;
		} catch (error) {
			console.error("Error in ModeStringToInt function:", error);
			return -1;
		}
	}

	/**
	 * Converts base beatmap stats (CS, OD, AR, HP, BPM, length) based on mods and game mode.
	 *
	 * @param {object} stats - Original beatmap stats.
	 * @param {number} stats.cs - Circle Size.
	 * @param {number} stats.od - Overall Difficulty.
	 * @param {number} stats.hp - HP Drain Rate.
	 * @param {number} stats.ar - Approach Rate.
	 * @param {number} stats.bpm - Base BPM of the beatmap.
	 * @param {number} stats.length - Map length in milliseconds.
	 * @param {number|string} mode - Game mode (0–3 or 'osu', 'taiko', 'ctb', 'mania').
	 * @param {number} mods - Bitwise integer representing applied mods.
	 * @returns {object} - New object containing modified stats { cs, od, hp, ar, bpm, length }.
	 * @throws {Error} - Throws if mode is invalid or conversion fails.
	 */
	ConvertStatsWithMods(stats, mode, mods) {
		try {
			let modeInt = typeof mode === 'string' ? this.ModeStringToInt(mode) : mode;
			if (modeInt < 0 || modeInt > 3) throw new Error("Invalid game mode");

			let {
				cs,
				od,
				hp,
				ar,
				bpm,
				length
			} = stats;

			const hasHR = (mods & Mods.HR) !== 0;
			const hasEZ = (mods & Mods.EZ) !== 0;
			const hasDT = (mods & Mods.DT) !== 0;
			const hasNC = (mods & Mods.NC) !== 0;
			const hasHT = (mods & Mods.HT) !== 0;

			let clockRate = 1;
			if (hasDT || hasNC) clockRate = 1.5;
			else if (hasHT) clockRate = 0.75;

			if (hasHR) {
				cs = applyHR(cs, 1.3);
				od = applyHR(od, 1.4);
				ar = applyHR(ar, 1.4);
				hp = applyHR(hp, 1.4);
			}

			if (hasEZ) {
				cs = applyEZ(cs);
				od = applyEZ(od);
				ar = applyEZ(ar);
				hp = applyEZ(hp);
			}

			if (modeInt === 0) {
				let arMs = arToMs(ar);
				arMs = arMs / clockRate;
				ar = msToAr(arMs);
				ar = Math.max(0, Math.min(11, ar));
			}

			bpm = applyBpmMultiplier(bpm, clockRate);
			length = applyLengthMultiplier(length, clockRate);

			return {
				cs: +cs.toFixed(2),
				od: +od.toFixed(2),
				hp: +hp.toFixed(2),
				ar: +ar.toFixed(2),
				bpm: +bpm.toFixed(2),
				length: Math.round(length)
			};
		} catch (err) {
			throw err;
		}
	}


	/**
	 * Parses a map file and invokes a callback with the parsed information.
	 * @param {string} file - The path to the map file.
	 * @param {(error: Error | null, parsedData?: any) => void} callback - The callback function to be invoked.
	 */
	ParseMapFile(file, callback) {
		fs.exists(file, function (exists) {
			if (!exists) {
				callback(new Error('File does not exist'));
				return;
			}

			const parser = parseBm();
			const stream = fs.createReadStream(file);
			let buffer = '';

			stream.on('data', function (chunk) {
				buffer += chunk;
				processBuffer();
			});

			stream.on('error', function (err) {
				callback(err);
			});

			stream.on('end', function () {
				processBuffer();
				callback(null, parser.ConvertBeatmapArray());
			});

			/**
			 * Processes the buffer by splitting it into lines and parsing each line.
			 */
			function processBuffer() {
				const lines = buffer.split(/\r?\n/);
				buffer = lines.pop() || '';
				lines.forEach(parser.lineListens);
			}
		});
	}


	/**
	 * Parses a Bancho message and extracts relevant information.
	 * @param {object} objectMessage - The Bancho message object.
	 * @param {string} objectMessage.content - The content of the message.
	 * @param {string} objectMessage.pseudo - The pseudo (username) associated with the message.
	 * @returns {?object} - Parsed information in the form of an object, or null if the message is not valid.
	 */
	BanchoMessage(objectMessage) {
		const messageContent = objectMessage.content
		let match
		if (objectMessage.pseudo === "BanchoBot") {
			if (regexJoined.test(messageContent)) {
				match = messageContent.match(regexJoined);

				if (match) {
					const pseudo = match[1];
					const slot = parseInt(match[2]);
					return { event: 'joined', player: pseudo, slot: slot };
				} else {
					return null;
				}
			} else if (regexMoved.test(messageContent)) {
				match = messageContent.match(regexMoved);

				if (match) {
					const pseudo = match[1];
					const slot = parseInt(match[1]);
					return { event: 'moved', player: pseudo, slot: slot };
				} else {
					return null;
				}
			} else if (regexLeft.test(messageContent)) {
				match = messageContent.match(regexLeft);
				const pseudo = match[1];
				return { event: 'left', player: pseudo };
			} else if (regexChangeMap.test(messageContent)) {
				match = messageContent.match(regexChangeMap);
				const mapID = parseInt(messageContent.slice(messageContent.lastIndexOf('/') + 1), 10);
				return { event: 'changeMap', mapID: mapID };
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

}
module.exports = OsuUtils;






