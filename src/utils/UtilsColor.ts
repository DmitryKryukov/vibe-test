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

export function parseColor(colorString: string): Phaser.Display.Color {
    return Phaser.Display.Color.HexStringToColor(colorString);
}

export function interpolateColor(
    from: Phaser.Display.Color,
    to: Phaser.Display.Color,
    progress: number
): number {
    const progressValue = progress * 100;
    const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(
        from, to, 100, progressValue
    );
    return Phaser.Display.Color.GetColor(interpolated.r, interpolated.g, interpolated.b);
}

export function interpolateColorToHex(
    from: Phaser.Display.Color,
    to: Phaser.Display.Color,
    progress: number
): string {
    const progressValue = progress * 100;
    const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(
        from, to, 100, progressValue
    );
    return Phaser.Display.Color.RGBToString(
        interpolated.r, interpolated.g, interpolated.b, 255, '#'
    );
}