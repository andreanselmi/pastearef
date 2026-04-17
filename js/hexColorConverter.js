/*Converts between HEX #ff0000 color input and a normalized [R,G,B] array which is what Sketchfab API wants*/

function hexToNormalizedRgb(hex) {
    // 1. Remove the '#' if it's there
    hex = hex.replace('#', '');

    // 2. Parse the hex strings into integers (Base 16)
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // 3. Normalize by dividing by 255 and return the array
    return [
        r / 255,
        g / 255,
        b / 255
    ];
}

function normalizedRgbToHex(normalizedArray) {
	return "#" + normalizedArray.map(val => {
        const hex = Math.round(val * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex; // if the hex is too short of a number like "5" it adds a 0 and gives "05"
    }).join(''); // join the 3 values together in a single hex code
}