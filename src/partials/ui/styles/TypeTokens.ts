import Phaser from 'phaser';
import { FONTTOKEN } from './FontTokens';
import { COLORTOKEN } from "./ColorTokens"
import { METRICTOKEN } from "./MetricTokens"

export namespace TYPETOKEN {
    export const Primary: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
        Display: {
            fontFamily: FONTTOKEN.FontFamily.xprm3,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Display.Size,
            color: COLORTOKEN.Foreground.Primary,
        },
        Tagline: {
            fontFamily: FONTTOKEN.FontFamily.xprm3,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Tagline.Size,
            color: COLORTOKEN.Foreground.Primary,
        },
        Lead: {
            fontFamily: FONTTOKEN.FontFamily.xprm3,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Lead.Size,
            color: COLORTOKEN.Foreground.Primary,
        },
    }

    export const Secondary: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
        Tagline: {
            fontFamily: FONTTOKEN.FontFamily.radiance,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Tagline.Size,
            color: COLORTOKEN.Foreground.Primary,
        },
        Lead: {
            fontFamily: FONTTOKEN.FontFamily.radiance,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Lead.Size,
            color: COLORTOKEN.Foreground.Primary,
        },
        Body: {
            fontFamily: FONTTOKEN.FontFamily.radiance,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Body.Size,
            color: COLORTOKEN.Foreground.Primary,
        },
        Caption: {
            fontFamily: FONTTOKEN.FontFamily.radiance,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Caption.Size,
            color: COLORTOKEN.Foreground.Quanternary,
            lineSpacing: METRICTOKEN.Typography.Caption.LineSpacing,
        }
    }

    export const Tertiary: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
        Lead: {
            fontFamily: FONTTOKEN.FontFamily.reaver,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Lead.Size,
            color: COLORTOKEN.Foreground.Primary,
        },
        Body: {
            fontFamily: FONTTOKEN.FontFamily.reaver,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Body.Size,
            color: COLORTOKEN.Foreground.Primary,
        },
        Caption: {
            fontFamily: FONTTOKEN.FontFamily.reaver,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Caption.Size,
            lineSpacing: METRICTOKEN.Typography.Caption.LineSpacing,
            color: COLORTOKEN.Foreground.Primary,
        },
        Label: {
            fontFamily: FONTTOKEN.FontFamily.reaver,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Label.Size,
            lineSpacing: METRICTOKEN.Typography.Label.LineSpacing,
            color: COLORTOKEN.Foreground.Primary,
        }
    }
}