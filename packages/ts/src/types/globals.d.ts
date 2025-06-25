/* eslint-disable no-var */
export {}

declare global {
  var UNOVIS_ICON_FONT_FAMILY: string | undefined
  var UNOVIS_FONT_W2H_RATIO_DEFAULT: number | undefined
  var UNOVIS_TEXT_SEPARATOR_DEFAULT: string[] | undefined
  var UNOVIS_TEXT_HYPHEN_CHARACTER_DEFAULT: string | undefined
  var UNOVIS_TEXT_DEFAULT: import('./text').UnovisText | undefined
  var UNOVIS_COLORS: string[] | undefined
  var UNOVIS_COLORS_DARK: string[] | undefined
}
