# Osu-Utils
[![npm version](https://img.shields.io/npm/v/osu-utils)]([https://www.npmjs.com/package/osu-utils](https://www.npmjs.com/package/osu-utils))
[![Downloads](https://img.shields.io/npm/dt/osu-utils)]([https://www.npmjs.com/package/osu-utils)


## Who osu-utils ? 
Osu Utils is an open source node js library allowing to have many tools for the creation of project related to osu. 
It includes simple processes such as calculating accuracy but also parsing a score entirely to extract accurate data. 

## Installation

1. Install osu utils using npm:
    ```bash
    npm install osu-utils
    ```
2. Import osu utils in your javascript project:
    ```javascript
    const osu_utils = require('osu-utils');
    const osuUtils = new osu_utils();
    ```
## Usage

## `CalcAccuracy` Function

The `CalcAccuracy` function is designed to calculate accuracy for various game modes in the context of rhythm games. It takes several parameters representing the number of hits of different types and additional parameters specific to certain game modes.

### Parameters:

- `m` (Game Mode): An integer representing the game mode. Should be one of the values [0, 1, 2, 3].
- `h3`, `h1`, `h5`, `h0` (Hit Counts): The counts of different hit types. For standard modes, `h3` represents 300s, `h1` represents 100s, `h5` represents 50s, and `h0` represents misses. For other modes, refer to specific calculations for Taiko, Catch the Beat (CtB), and Mania.
- `k` (CtB Mode): An optional parameter representing a specific value for CtB mode. Default is 0.
- `g` (Mania Mode): An optional parameter representing a specific value for Mania mode. Default is 0.

### Usage:

```javascript
try {
    // Example for Standard Mode
    const accuracyStandard = osuUtils.CalcAccuracy(0, 150, 50, 10, 5);

    // Example for Taiko Mode
    const accuracyTaiko = osuUtils.CalcAccuracy(1, 300, 50, 10);

    // Example for Catch the Beat Mode
    const accuracyCtB = osuUtils.CalcAccuracy(2, 100, 30, 5, 0.5);

    // Example for Mania Mode
    const accuracyMania = osuUtils.CalcAccuracy(3, 800, 150, 20, 10, 0.5, 2);

    console.log(accuracyStandard, accuracyTaiko, accuracyCtB, accuracyMania);
} catch (error) {
    console.error(error.message);
}
```
## `Rank` Function

The `Rank` function is designed to determine the rank based on the provided parameters such as hit counts, accuracy, and specific parameters for certain game modes.

### Parameters:

- `m` (Game Mode): An integer representing the game mode. Should be one of the values [0, 1, 2, 3].
- `h3`, `h1`, `h5`, `h0` (Hit Counts): The counts of different hit types. For standard modes, `h3` represents 300s, `h1` represents 100s, `h5` represents 50s, and `h0` represents misses.
- `mds` (Mod Strings): An optional parameter representing mod strings specific to the beatmap. Default is `null`.
- `pAcc` (Player Accuracy): A floating-point number representing the player's accuracy.

### Usage:

```javascript
try {
    // Example for Standard Mode
    const rankStandard = osuUtils.Rank(0, 150, 50, 10, 5, "HDHR", 98.5);

    // Example for Taiko Mode
    const rankTaiko = osuUtils.Rank(1, 300, 50, 10, null, 96.2);

    // Example for Catch the Beat Mode
    const rankCtB = osuUtils.Rank(2, 100, 30, 5, "NF", 92.0);

    // Example for Mania Mode
    const rankMania = osuUtils.Rank(3, 800, 150, 20, 10, "EZHT", 99.8);

    console.log(rankStandard, rankTaiko, rankCtB, rankMania);
} catch (error) {
    console.error(error.message);
}
```

## `TimeStampToMs` Function

The `TimeStampToMs` function is a simple wrapper function that converts a timestamp in milliseconds using another function called `tsMs`.

### Parameters:

- `ms` (Timestamp in Milliseconds): An integer representing a timestamp in milliseconds.

### Usage:

```javascript
// Example
const timestamp = 1642310400000; // January 17, 2022, 00:00:00 UTC
const convertedTime = osuUtils.TimeStampToMs(timestamp);

console.log(convertedTime);
```
## `ModsIntToString` Function

The `ModsIntToString` function is designed to convert a numeric representation of mods into a space-separated string of mod names. It utilizes a predefined `Mods` object to map numeric values to mod names.

### Parameters:

- `int` (Numeric Representation of Mods): An integer representing the numeric value of mods.

### Usage:

```javascript
// Example
const modsValue = 34; // Numeric representation of mods
const modNamesString = osuUtils.ModsIntToString(modsValue);

console.log(modNamesString);
```

## `ModeStringToInt` Function

The `ModeStringToInt` function is designed to convert a mode string into its corresponding numeric representation using a predefined `Modes` object.

### Parameters:

- `modeString` (Mode String): A string representing the mode ('osu', 'taiko', 'ctb', 'mania').

### Usage:

```javascript
// Example
const modeString = 'osu'; // Mode string
const modeNumeric = osuUtils.ModeStringToInt(modeString);

console.log(modeNumeric);
```

## `ParseMapFile` Function

The `ParseMapFile` function is designed to parse a map file and invoke a callback with the parsed information. It utilizes the `parseBm` module for parsing the beatmap data.

### Parameters:

- `file` (File Path): A string representing the path to the map file.
- `callback` (Callback Function): A callback function that will be invoked with the parsed information or an error. It has the signature `(error: Error | null, parsedData?: any) => void`.

### Usage:

```javascript
// Example
const filePath = '/path/to/beatmap.osu'; // Replace with the actual file path
osuUtils.ParseMapFile(filePath, function (error, parsedData) {
    if (error) {
        console.error(error.message);
    } else {
        console.log(parsedData);
    }
});
```

| Property                | Type               | Description                                         |
|-------------------------|--------------------|-----------------------------------------------------|
| `nbCircles`             | number             | Number of circles in the map                         |
| `nbSliders`             | number             | Number of sliders in the map                         |
| `nbSpinners`            | number             | Number of spinners in the map                        |
| `fileFormat`            | string             | Map file format                                     |
| `AudioFilename`         | string             | Audio file name                                     |
| `AudioLeadIn`           | string             | Audio lead-in time                                   |
| `PreviewTime`           | string             | Preview time                                        |
| `Countdown`             | string             | Countdown enabled (1) or disabled (0)               |
| `SampleSet`             | string             | Used sample set                                     |
| `StackLeniency`         | string             | Object stacking leniency                            |
| `Mode`                  | string             | Game mode (0: osu!, 1: Taiko, 2: Catch the Beat, 3: Mania)|
| `LetterboxInBreaks`     | string             | Letterboxing in breaks enabled (1) or disabled (0)   |
| `timingPoints`          | array of objects   | Timing points in the map                             |
| `breakTimes`            | array of objects   | Break periods in the map                             |
| `hitObjects`            | array of objects   | Hittable objects in the map   
|

#### Example object in `timingPoints`:

| Property              | Type      | Description                                           |
|-----------------------|-----------|-------------------------------------------------------|
| `offset`              | number    | Temporal offset of the timing point                   |
| `beatLength`          | number    | Length of one beat in milliseconds                    |
| `velocity`            | number    | Velocity factor                                      |
| `timingSignature`     | number    | Rhythmic timing signature                            |
| `sampleSetId`         | number    | Sample set identifier                                 |
| `customSampleIndex`   | number    | Custom sample index                                   |
| `sampleVolume`        | number    | Sample volume                                         |
| `timingChange`        | boolean   | Timing change indicator                               |
| `kiaiTimeActive`      | boolean   | Kiai Time activation indicator                        |
| `bpm`                 | number    | Beats per minute (BPM)                                |

### Example object in `brealTime`:

| Property              | Type      | Description                                           |
|-----------------------|-----------|-------------------------------------------------------|
| `startTime`           | number    | Start of the break period in milliseconds             |
| `endTime`             | number    | End of the break period in milliseconds               |

### Example object in `hitObjects` (circle):

| Property           | Type      | Description                                     |
|---------------------|-----------|-------------------------------------------------|
| `startTime`        | number    | Start time of the object in milliseconds        |
| `newCombo`         | boolean   | New combo indicator                             |
| `soundTypes`       | array     | Sound types associated with the object          |
| `position`         | array     | Object position on the screen                   |
| `objectName`       | string    | Object name (circle, slider, spinner, etc.)     |
| `additions`        | object    | Additional information                           |

### Example object in `hitObjects` (slider):

| Property           | Type      | Description                                              |
|---------------------|-----------|----------------------------------------------------------|
| `startTime`        | number    | Start time of the object in milliseconds                 |
| `newCombo`         | boolean   | New combo indicator                                      |
| `soundTypes`       | array     | Sound types associated with the object                   |
| `position`         | array     | Object position on the screen                            |
| `objectName`       | string    | Object name (circle, slider, spinner, etc.)              |
| `repeatCount`      | number    | Number of repeats for sliders                            |
| `pixelLength`      | number    | Length of the slider in pixels                           |
| `additions`        | object    | Additional information                                   |
| `edges`            | array of objects | Information about slider edges (sound, additions)    |
| `points`           | array of arrays | Control points of the slider (x, y coordinates)       |
| `duration`         | number    | Total duration of the slider in milliseconds            |
| `endTime`          | number    | End time of the slider in milliseconds                  |
| `curveType`        | string    | Type of slider curve (bezier, linear, catmull)          |
| `endPosition`      | array     | Final position of the slider (x, y coordinates)        |




## `BanchoMessage` Function

The `BanchoMessage` function is designed to parse a Bancho message and extract relevant information based on the message content and associated username.

### Parameters:

- `objectMessage` (Bancho Message Object):
  - `objectMessage.content` (string): The content of the Bancho message.
  - `objectMessage.pseudo` (string): The username (pseudo) associated with the message.

### Usage:

```javascript
// Example
const banchoMessage = {
    content: "joined room Slot1",
    pseudo: "BanchoBot"
};

const parsedInfo = osuUtils.BanchoMessage(banchoMessage);

if (parsedInfo) {
    console.log(parsedInfo);
} else {
    console.log("Invalid Bancho message");
}
```
| Property | Type    | Description                                      |
|----------|---------|--------------------------------------------------|
| `event`  | string  | The type of event ('joined', 'moved', 'left', 'changeMap'). |
| `player` | string  | The pseudo (username) associated with the event. |
| `slot`   | number  | The slot number associated with the event (only for 'joined' and 'moved'). |
| `mapID`  | number  | The ID of the map associated with the event (only for 'changeMap'). |

## Contributing
Contributions are welcome! If you find any issues or want to add new features, feel free to submit a pull request.

