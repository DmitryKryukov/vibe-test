import cstmXprmntl3Xpr31000Url from '@fonts/cstm-xprmntl-3-xpr3-1000.ttf?url';
import radianceRegularUrl from '@fonts/radiance-regular.otf?url';
import radianceSemiboldUrl from '@fonts/radiance-semibold.otf?url';
import radianceBoldUrl from '@fonts/radiance-bold.otf?url';
import reaverRegularUrl from '@fonts/reaver-regular.otf?url';
import reaverBlackUrl from '@fonts/reaver-black.otf?url';

export namespace FONTTOKEN {

    export interface FontDefinition {
        family: string;
        source: string;
        style?: string;
        weight?: string;
        format: 'truetype' | 'opentype';
        variationSettings?: string;
    }

    export const BasicFontFamily = {
        xprm3: 'CSTM Xprmntl 3',
        radiance: 'Radiance',
        reaver: 'Reaver',
    } as const;

    export const FontFamily = {
        xprm3: `"${BasicFontFamily.xprm3}"`,
        radiance: BasicFontFamily.radiance,
        reaver: BasicFontFamily.reaver,
    } as const;

    export const FontDefinitions: readonly FontDefinition[] = [
        {
            family: BasicFontFamily.xprm3,
            source: cstmXprmntl3Xpr31000Url,
            format: 'truetype',
            style: 'normal',
            weight: '400',
        },
        {
            family: BasicFontFamily.radiance,
            source: radianceRegularUrl,
            format: 'opentype',
            style: 'normal',
            weight: '400',
        },
        {
            family: BasicFontFamily.radiance,
            source: radianceSemiboldUrl,
            format: 'opentype',
            style: 'normal',
            weight: '600',
        },
        {
            family: BasicFontFamily.radiance,
            source: radianceBoldUrl,
            format: 'opentype',
            style: 'normal',
            weight: '700',
        },
        {
            family: BasicFontFamily.reaver,
            source: reaverRegularUrl,
            format: 'opentype',
            style: 'normal',
            weight: '400',
        },
        {
            family: BasicFontFamily.reaver,
            source: reaverBlackUrl,
            format: 'opentype',
            style: 'normal',
            weight: '900',
        },
    ] as const;

}
