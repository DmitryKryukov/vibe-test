export namespace COLORTOKEN {
    export const Background = {
        Zeroth: '#020302',
        Primary: '#1A1D1B',
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
}
