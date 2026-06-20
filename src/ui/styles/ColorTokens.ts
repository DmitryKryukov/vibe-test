export namespace COLORTOKEN {
    export const Background = {
        Zeroth: '#020302',
        Accent: {
            Primary: '#FFDD73',
        },
    } as const;

    export const Foreground = {
        Primary: '#ffffff',
        Secondary: '#FFDD73',
    } as const;

    export const Utility = {
        Transparent: '#00000000',
    }

    export const Component = {
        Button: {
            Primary: {
                Idle: {
                    Text: { Color: Foreground.Primary},
                    Background: {
                        BackgroundColor: '#1A1D1B',
                        StrokeColor: '#1A1D1B',
                    }
                },
                Hover: {
                    Text: { Color:  Foreground.Primary },
                    Background: {
                        BackgroundColor: '#101211',
                        StrokeColor: '#101211',
                    }
                },
                Press: {
                    Text: { Color:  Foreground.Secondary },
                    Background: {
                        BackgroundColor: '#050505',
                        StrokeColor: '#050505',
                    }
                }
            }
        }
    }
}
