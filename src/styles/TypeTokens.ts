import Phaser from 'phaser';
import { FONTTOKEN } from './FontTokens';
import { COLORTOKEN } from './ColorTokens';
import { METRICTOKEN } from './MetricTokens';

type TypographyLevel = keyof typeof METRICTOKEN.Typography;

function createTypography(fontFamily: string): Record<TypographyLevel, Phaser.Types.GameObjects.Text.TextStyle> {
    return {
        Display: {
            fontFamily,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Display.Size,
            color: COLORTOKEN.Foreground.Primary.Hex,
        },
        Tagline: {
            fontFamily,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Tagline.Size,
            color: COLORTOKEN.Foreground.Primary.Hex,
        },
        Lead: {
            fontFamily,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Lead.Size,
            color: COLORTOKEN.Foreground.Primary.Hex,
        },
        Body: {
            fontFamily,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Body.Size,
            color: COLORTOKEN.Foreground.Primary.Hex,
        },
        Label: {
            fontFamily,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Label.Size,
            lineSpacing: METRICTOKEN.Typography.Label.LineSpacing,
            color: COLORTOKEN.Foreground.Primary.Hex,
        },
        Caption: {
            fontFamily,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Caption.Size,
            lineSpacing: METRICTOKEN.Typography.Caption.LineSpacing,
            color: COLORTOKEN.Foreground.Primary.Hex,
        },
    };
}

export namespace TYPETOKEN {
    export const Primary = createTypography(FONTTOKEN.FontFamily.xprm3);
    export const Secondary = createTypography(FONTTOKEN.FontFamily.radiance);
    export const Tertiary = createTypography(FONTTOKEN.FontFamily.reaver);

    Secondary.Caption.color = COLORTOKEN.Foreground.Quanternary.Hex;
}