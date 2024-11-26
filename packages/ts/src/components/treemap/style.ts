import { css } from '@emotion/css'

// Utils
import { getCssVarNames, injectGlobalCssVariables } from 'utils/style'

const cssVarDefaults = {
  '--vis-treemap-tile-stroke-color': '#ffffff',
  '--vis-treemap-tile-stroke-width': '1px',
  '--vis-treemap-tile-fill-color': '#B9BEC3',
  '--vis-treemap-tile-cursor': 'default',
  /* Undefined by default to allow proper fallback to var(--vis-font-family) */
  '--vis-treemap-label-font-family': undefined as undefined,
  '--vis-treemap-label-text-color': '#5b5f6d',
  '--vis-treemap-label-font-size': '12px',

  /* Dark Theme */
  '--vis-dark-treemap-tile-stroke-color': '#2c2c2c',
  '--vis-dark-treemap-tile-fill-color': '#5b5f6d',
  '--vis-dark-treemap-label-text-color': '#ffffff',
}

export const root = css`
  label: treemap-component;
  width: 100%;
  height: 100%;
  position: relative;
`

export const variables = getCssVarNames(cssVarDefaults)
injectGlobalCssVariables(cssVarDefaults, root)

export const tiles = css`
  label: g-tiles;
`

export const tile = css`
  label: tile;
  stroke: var(${variables.treemapTileStrokeColor});
  stroke-width: var(${variables.treemapTileStrokeWidth});
  fill: var(${variables.treemapTileFillColor});
  cursor: var(${variables.treemapTileCursor});
`

export const label = css`
  label: label;
  text-anchor: middle;
  fill: var(${variables.treemapLabelTextColor});
  font-family: var(${variables.treemapLabelFontFamily}, var(--vis-font-family));
  font-size: var(${variables.treemapLabelFontSize});
  pointer-events: none;
  font-weight: 600;
`
