const Regex_Sections = require('../regex/beatmapFile/sections')
const Regex_ValuesKey = require('../regex/beatmapFile/keys')
const slidercalc = require('../math/sliders')

/**
 * Parses a beatmap file and returns an object with parsed information.
 * @returns {object} - Parsed beatmap information.
 */

function parseBm() {
    let beatmap = {
        nbCircles: 0,
        nbSliders: 0,
        nbSpinners: 0,
        timingPoints: [],
        breakTimes: [],
        hitObjects: []
    };
    

    let osuSection;
    let elementProperties;

    let Lines_Timing = [];
    let Lines_Object = [];
    let Lines_Events = [];
    let Curves_Models = {
        C: "catmull",
        B: "bezier",
        L: "linear",
        P: "pass-through"
    };
    let Def_TimingPoints = function (offset) {
        for (let i = beatmap.timingPoints.length - 1; i >= 0; i--) {
            if (beatmap.timingPoints[i].offset <= offset) { return beatmap.timingPoints[i]; }
        }
        return beatmap.timingPoints[0];
    };

    let Def_ParseHitsounds = function (str) {
        if (!str) return {};

        let additions = {};
        let adds = str.split(':');

        if (adds[0] && adds[0] !== '0') {
            let sample;
            switch (adds[0]) {
                case '1':
                    sample = 'normal';
                    break;
                case '2':
                    sample = 'soft';
                    break;
                case '3':
                    sample = 'drum';
                    break;
            }
            additions.sample = sample;
        }

        if (adds[1] && adds[1] !== '0') {
            let addSample;
            switch (adds[1]) {
                case '1':
                    addSample = 'normal';
                    break;
                case '2':
                    addSample = 'soft';
                    break;
                case '3':
                    addSample = 'drum';
                    break;
            }
            additions.additionalSample = addSample;
        }

        if (adds[2] && adds[2] !== '0') { additions.customSampleIndex = parseInt(adds[2]); }
        if (adds[3] && adds[3] !== '0') { additions.hitsoundVolume = parseInt(adds[3]); }
        if (adds[4]) { additions.hitsound = adds[4]; }

        return additions;
    };

    let Def_ParseTimingPoints = function (line) {
        elementProperties = line.split(',');

        let timingPoint = {
            offset: parseInt(elementProperties[0]),
            beatLength: parseFloat(elementProperties[1]),
            velocity: 1,
            timingSignature: parseInt(elementProperties[2]),
            sampleSetId: parseInt(elementProperties[3]),
            customSampleIndex: parseInt(elementProperties[4]),
            sampleVolume: parseInt(elementProperties[5]),
            timingChange: (elementProperties[6] == 1),
            kiaiTimeActive: (elementProperties[7] == 1)
        };

        if (!isNaN(timingPoint.beatLength) && timingPoint.beatLength !== 0) {
            if (timingPoint.beatLength > 0) {
                let bpm = Math.round(60000 / timingPoint.beatLength);
                beatmap.bpmMin = beatmap.bpmMin ? Math.min(beatmap.bpmMin, bpm) : bpm;
                beatmap.bpmMax = beatmap.bpmMax ? Math.max(beatmap.bpmMax, bpm) : bpm;
                timingPoint.bpm = bpm;
            } else {
                timingPoint.velocity = Math.abs(100 / timingPoint.beatLength);
            }
        }

        beatmap.timingPoints.push(timingPoint);
    };

    let Def_ParseHitsObjects = function (line) {
        elementProperties = line.split(',');

        let soundType = elementProperties[4];
        let objectType = elementProperties[3];

        let hitObject = {
            startTime: parseInt(elementProperties[2]),
            newCombo: ((objectType & 4) == 4),
            soundTypes: [],
            position: [
                parseInt(elementProperties[0]),
                parseInt(elementProperties[1])
            ]
        };
        if ((soundType & 2) == 2) { hitObject.soundTypes.push('whistle'); }
        if ((soundType & 4) == 4) { hitObject.soundTypes.push('finish'); }
        if ((soundType & 8) == 8) { hitObject.soundTypes.push('clap'); }
        if (hitObject.soundTypes.length === 0) { hitObject.soundTypes.push('normal'); }
        if ((objectType & 1) == 1) {
            beatmap.nbCircles++;
            hitObject.objectName = 'circle';
            hitObject.additions = Def_ParseHitsounds(elementProperties[5]);
        } else if ((objectType & 8) == 8) {
            beatmap.nbSpinners++;
            hitObject.objectName = 'spinner';
            hitObject.endTime = parseInt(elementProperties[5]);
            hitObject.additions = Def_ParseHitsounds(elementProperties[6]);
        } else if ((objectType & 2) == 2) {
            beatmap.nbSliders++;
            hitObject.objectName = 'slider';
            hitObject.repeatCount = parseInt(elementProperties[6]);
            hitObject.pixelLength = parseInt(elementProperties[7]);
            hitObject.additions = Def_ParseHitsounds(elementProperties[10]);
            hitObject.edges = [];
            hitObject.points = [
                [hitObject.position[0], hitObject.position[1]]
            ];
            let timing = Def_TimingPoints(hitObject.startTime);

            if (timing) {
                let pxPerBeat = beatmap.SliderMultiplier * 100 * timing.velocity;
                let beatsNumber = (hitObject.pixelLength * hitObject.repeatCount) / pxPerBeat;
                hitObject.duration = Math.ceil(beatsNumber * timing.beatLength);
                hitObject.endTime = hitObject.startTime + hitObject.duration;
            }
            let points = (elementProperties[5] || '').split('|');
            if (points.length) {
                hitObject.curveType = Curves_Models[points[0]] || 'unknown';

                for (let i = 1, l = points.length; i < l; i++) {
                    let coordinates = points[i].split(':');
                    hitObject.points.push([
                        parseInt(coordinates[0]),
                        parseInt(coordinates[1])
                    ]);
                }
            }

            let edgeSounds = [];
            let edgeAdditions = [];
            if (elementProperties[8]) { edgeSounds = elementProperties[8].split('|'); }
            if (elementProperties[9]) { edgeAdditions = elementProperties[9].split('|'); }
            for (let j = 0, lgt = hitObject.repeatCount + 1; j < lgt; j++) {
                let edge = {
                    soundTypes: [],
                    additions: Def_ParseHitsounds(edgeAdditions[j])
                };

                if (edgeSounds[j]) {
                    let sound = edgeSounds[j];
                    if ((sound & 2) == 2) { edge.soundTypes.push('whistle'); }
                    if ((sound & 4) == 4) { edge.soundTypes.push('finish'); }
                    if ((sound & 8) == 8) { edge.soundTypes.push('clap'); }
                    if (edge.soundTypes.length === 0) { edge.soundTypes.push('normal'); }
                } else {
                    edge.soundTypes.push('normal');
                }

                hitObject.edges.push(edge);
            }

            let endPoint = slidercalc.getEndPoint(hitObject.curveType, hitObject.pixelLength, hitObject.points);
            if (endPoint && endPoint[0] && endPoint[1]) {
                hitObject.endPosition = [
                    Math.round(endPoint[0]),
                    Math.round(endPoint[1])
                ];
            } else {

                hitObject.endPosition = hitObject.points[hitObject.points.length - 1];
            }
        } else {

            hitObject.objectName = 'unknown';
        }

        beatmap.hitObjects.push(hitObject);
    };


    let Def_ParseEvents = function (line) {
        elementProperties = line.split(',');

        if (elementProperties[0] == '0' && elementProperties[1] == '0' && elementProperties[2]) {
            let bgName = elementProperties[2].trim();

            if (bgName.charAt(0) == '"' && bgName.charAt(bgName.length - 1) == '"') {
                beatmap.bgFilename = bgName.substring(1, bgName.length - 1);
            } else {
                beatmap.bgFilename = bgName;
            }
        } else if (elementProperties[0] == '2' && /^[0-9]+$/.test(elementProperties[1]) && /^[0-9]+$/.test(elementProperties[2])) {
            beatmap.breakTimes.push({
                startTime: parseInt(elementProperties[1]),
                endTime: parseInt(elementProperties[2])
            });
        }
    };

    let Def_DurationSets = function () {
        let firstObject = beatmap.hitObjects[0];
        let lastObject = beatmap.hitObjects[beatmap.hitObjects.length - 1];

        let totalBreakTime = 0;

        beatmap.breakTimes.forEach(function (breakTime) {
            totalBreakTime += (breakTime.endTime - breakTime.startTime);
        });

        if (firstObject && lastObject) {
            beatmap.totalTime = Math.floor(lastObject.startTime / 1000);
            beatmap.drainingTime = Math.floor((lastObject.startTime - firstObject.startTime - totalBreakTime) / 1000);
        } else {
            beatmap.totalTime = 0;
            beatmap.drainingTime = 0;
        }
    };

    let Def_MaxComboSets = function () {
        if (beatmap.timingPoints.length === 0) { return; }

        let maxCombo = 0;
        let sliderMultiplier = parseFloat(beatmap.SliderMultiplier);
        let sliderTickRate = parseInt(beatmap.SliderTickRate, 10);

        let timingPoints = beatmap.timingPoints;
        let currentTiming = timingPoints[0];
        let nextOffset = timingPoints[1] ? timingPoints[1].offset : Infinity;
        let i = 1;

        beatmap.hitObjects.forEach(function (hitObject) {
            if (hitObject.startTime >= nextOffset) {
                currentTiming = timingPoints[i++];
                nextOffset = timingPoints[i] ? timingPoints[i].offset : Infinity;
            }

            let osupxPerBeat = sliderMultiplier * 100 * currentTiming.velocity;
            let tickLength = osupxPerBeat / sliderTickRate;

            switch (hitObject.objectName) {
                case 'spinner':
                case 'circle':
                    maxCombo++;
                    break;
                case 'slider':
                    let tickPerSide = Math.ceil((Math.floor(hitObject.pixelLength / tickLength * 100) / 100) - 1);
                    maxCombo += (hitObject.edges.length - 1) * (tickPerSide + 1) + 1;
            }
        });

        beatmap.maxCombo = maxCombo;
    };

    let lineListens = function (line) {


        line = line.toString().trim();
        if (!line) { return; }

        let match = Regex_Sections.exec(line);
        if (match) {
            osuSection = match[1].toLowerCase();
            return;
        }

        switch (osuSection) {
            case 'timingpoints':
                Lines_Timing.push(line);
                break;
            case 'hitobjects':
                Lines_Object.push(line);
                break;
            case 'events':
                Lines_Events.push(line);
                break;
            default:
                if (!osuSection) {
                    match = /^osu file format (v[0-9]+)$/.exec(line);
                    if (match) {
                        beatmap.fileFormat = match[1];
                        return;
                    }
                }

                match = Regex_ValuesKey.exec(line);
                if (match) { beatmap[match[1]] = match[2]; }
        }
    };

    let ConvertBeatmapArray = function () {
        if (beatmap.Tags) {
            beatmap.tagsArray = beatmap.Tags.split(' ');
        }

        Lines_Events.forEach(Def_ParseEvents);
        beatmap.breakTimes.sort(function (a, b) { return (a.startTime > b.startTime ? 1 : -1); });

        Lines_Timing.forEach(Def_ParseTimingPoints);
        beatmap.timingPoints.sort(function (a, b) { return (a.offset > b.offset ? 1 : -1); });

        let timingPoints = beatmap.timingPoints;

        for (let i = 1, l = timingPoints.length; i < l; i++) {
            if (!timingPoints[i].hasOwnProperty('bpm')) {
                timingPoints[i].beatLength = timingPoints[i - 1].beatLength;
                timingPoints[i].bpm = timingPoints[i - 1].bpm;
            }
        }

        Lines_Object.forEach(Def_ParseHitsObjects);
        beatmap.hitObjects.sort(function (a, b) { return (a.startTime > b.startTime ? 1 : -1); });

        Def_MaxComboSets();
        Def_DurationSets();

        return beatmap;
    };

    return {
        lineListens: lineListens,
        ConvertBeatmapArray: ConvertBeatmapArray
    };
}


module.exports = parseBm
