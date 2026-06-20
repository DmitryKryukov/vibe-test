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
        }
    }
    
    export const Secondary: Record<string, Phaser.Types.GameObjects.Text.TextStyle> = {
        Lead: {
            fontFamily: FONTTOKEN.FontFamily.radiance,
            resolution: 2,
            fontSize: METRICTOKEN.Typography.Lead.Size,
            color: COLORTOKEN.Foreground.Primary,
        }
    }
}