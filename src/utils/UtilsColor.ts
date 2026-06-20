export function hexStringToNumber(hex: string): number {
    const cleanHex = hex.replace(/^#/, '').toUpperCase();

    const expandedHex = cleanHex.length === 3
        ? cleanHex.split('').map((char) => char + char).join('')
        : cleanHex;

    const parsedValue = parseInt(expandedHex, 16);

    if (Number.isNaN(parsedValue)) {
        console.warn(`[hexStringToNumber] Невалидный HEX-формат: "${hex}". Fallback на 0x000000.`);
        return 0x000000;
    }

    return parsedValue;
}

export type ColorNumber = number;

export function anyToColor(input: string | number): ColorNumber {
    if (typeof input === 'string') {
        return hexStringToNumber(input);
    }
    
    return input;
}