import { EncounterType } from "@/data/Map";

type Color = {
    Hex: string;
    Numeric: number;
};

const color = (hex: string): Color => {
    const formattedHex = hex.startsWith('#') ? hex : `#${hex}`;
    return {
        Hex: formattedHex,
        Numeric: Number(formattedHex.replace('#', '0x')),
    };
};

export namespace COLORTOKEN {
    export const Background = {
        Zeroth: color('#020302'),
        Primary: color('#1A1D1B'),
        Secondary: color('#16140f'),
        Tertiary: color('#37301c'),
        Accent: {
            Primary: color('#FFDD73'),
        },
    } as const;

    export const Foreground = {
        Primary: color('#ffffff'),
        Secondary: color('#FFDD73'),
        Tertiary: color('#998C64'),
        Quanternary: color('#aaaaaa'),
    } as const;

    export const Utility = {
        Transparent: color('#00000000'),
    } as const;

    export const Accent = {
        Red: color('#FF472E'),
        Gold: color('#F6B94D'),
    } as const;

    export const Component = {
        Button: {
            Primary: {
                Idle: {
                    Text: { Color: color('#ffffff') },
                    Background: { BackgroundColor: color('#1A1D1B'), StrokeColor: color('#1A1D1B') },
                },
                Hover: {
                    Text: { Color: color('#ffffff') },
                    Background: { BackgroundColor: color('#101211'), StrokeColor: color('#101211') },
                },
                Press: {
                    Text: { Color: color('#FFDD73') },
                    Background: { BackgroundColor: color('#050505'), StrokeColor: color('#050505') },
                },
            },
        },
        SelectorCard: {
            Primary: {
                Unselected: {
                    Idle: { Background: { BackgroundColor: color('#1A1D1B') } },
                    Hover: { Background: { BackgroundColor: color('#101211') } },
                    Press: { Background: { BackgroundColor: color('#050505') } },
                },
                Selected: {
                    Idle: { Background: { BackgroundColor: color('#22231E') } },
                    Hover: { Background: { BackgroundColor: color('#26271F') } },
                    Press: { Background: { BackgroundColor: color('#2D2C22') } },
                },
            },
        },
    } as const;

    export const Node = {
        start: color('#5b6f52'),
        battle: color('#725034'),
        elite: color('#8c2222'),
        merchant: color('#b28a38'),
        event: color('#7561a3'),
        camp: color('#4f875f'),
        boss: color('#c41f1f'),
    } satisfies Record<EncounterType, Color>;
}
