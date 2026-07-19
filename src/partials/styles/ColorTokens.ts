import { EncounterType } from "@/data/Map";

export namespace COLORTOKEN {
    export const Background = {
        Zeroth: '#020302',
        Primary: '#1A1D1B',
        Secondary: '#16140f',
        Tertiary: '#37301c',
        Accent: {
            Primary: '#FFDD73',
        },
    } as const;

    export const Foreground = {
        Primary: '#ffffff',
        Secondary: '#FFDD73',
        Tertiary: '#998C64',
        Quanternary: '#aaaaaa',
    } as const;

    export const Utility = {
        Transparent: '#00000000',
    }

    export const Accent = {
        Red: '#FF472E',
        Gold: '#F6B94D',
    }

    export const Component = {
        Button: {
            Primary: {
                Idle: {
                    Text: { Color: Foreground.Primary },
                    Background: {
                        BackgroundColor: '#1A1D1B',
                        StrokeColor: '#1A1D1B',
                    }
                },
                Hover: {
                    Text: { Color: Foreground.Primary },
                    Background: {
                        BackgroundColor: '#101211',
                        StrokeColor: '#101211',
                    }
                },
                Press: {
                    Text: { Color: Foreground.Secondary },
                    Background: {
                        BackgroundColor: '#050505',
                        StrokeColor: '#050505',
                    }
                }
            }
        },
        SelectorCard: {
            Primary: {
                Unselected: {
                    Idle: {
                        Background: {
                            BackgroundColor: '#1A1D1B',
                        }
                    },
                    Hover: {
                        Background: {
                            BackgroundColor: '#101211',
                        }
                    },
                    Press: {
                        Background: {
                            BackgroundColor: '#050505',
                        }
                    }
                },
                Selected: {
                    Idle: {
                        Background: {
                            BackgroundColor: '#22231E',
                        }
                    },
                    Hover: {
                        Background: {
                            BackgroundColor: '#26271F',
                        }
                    },
                    Press: {
                        Background: {
                            BackgroundColor: '#2D2C22',
                        }
                    }
                }
            }
        }
    }

    export const Node: Record<EncounterType, number> = {
        start: 0x5b6f52,
        battle: 0x725034,
        elite: 0x8c2222,
        merchant: 0xb28a38,
        event: 0x7561a3,
        camp: 0x4f875f,
        boss: 0xc41f1f
    }
}