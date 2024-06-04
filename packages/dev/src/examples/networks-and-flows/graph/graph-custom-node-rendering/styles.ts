import { css } from '@emotion/css'

export const exaforceGraph = css`
  label: exaforce-graph;
  --vis-graph-node-label-font-size: 7pt;
  --vis-graph-node-label-text-color: var(--exf-text-secondary);
  --vis-graph-node-sublabel-font-size: 9pt;
  --vis-graph-node-sublabel-text-color: var(--exf-text-primary);
  --vis-dark-graph-node-label-text-color: var(--exf-text-secondary);
  --vis-dark-graph-node-sublabel-text-color: var(--exf-text-primary);
  --vis-graph-node-greyout-opacity: 0.5;
  --vis-graph-node-selection-color: var(--exf-text-primary);
  --vis-dark-graph-node-selection-color: var(--exf-text-primary);

  --exf-graph-node-identity: #F5F3FE;
  --exf-graph-node-network: #FEF7EE;
  --exf-graph-node-resource: #EFF2FE;
  --exf-graph-node-compute: #F0F6FE;
  --exf-graph-node-secret: #F2FDFA;
  --exf-graph-node-finding: #FDF1F2;
  --exf-graph-node-threat-actor: #AE2A3F;

  --exf-graph-font: "Noto Sans Mono", monospace;
  --exf-graph-circle-label-font-size: 8px;
  --exf-graph-circle-label-font-weight: 600;
  --exf-graph-circle-label-fill: #fff;
  --exf-graph-circle-label-background-fill: #52525A;
  --exf-graph-circle-label-background-stroke: #fff;

  --exf-severity-critical: #ae2a3f;
  --exf-severity-high: #e14f62;
  --exf-severity-medium: #d9622b;
  --exf-severity-low: #e2b53e;

  [clickable="true"] {
    cursor: pointer;
  }
`

// Node Appearance
export const node = css`label: node-group;`
export const nodeCircle = css`label: node-background;`
export const nodeIcon = css`label: node-icon;`
export const nodeSelectionBackground = css`label: node-selection-background;`
export const nodeHighlightBackground = css`label: node-highlight-background;`

// Node Aggregation
export const nodeAggregationBackground = css`label: node-aggregation-background;`
export const nodeAggregationText = css`label: node-aggregation-text;`

// Watchlist
export const nodeWatchlistBackground = css`label: node-watchlist-background;`
export const nodeWatchlistIcon = css`label: node-watchlist-icon;`

// Session Count
export const nodeSessionCountBackground = css`label: node-session-count-background;`
export const nodeSessionCountText = css`label: node-session-count-text;`

// Alerts
export const nodeAlert = css`label: node-alert;`
export const nodeAlertBackground = css`label: node-alert-background;`
export const nodeAlertText = css`label: node-alert-text;`

// Enrichment
export const nodeEnrichments = css`label: node-enrichments;`
export const nodeEnrichmentBackground = css`label: node-enrichment-background;`
export const nodeEnrichmentIcon = css`label: node-enrichment-icon;`

// Shared Circle Label Styles
export const nodeCircleLabelBackground = css`
  label: node-circle-label-background;
  fill: var(--exf-graph-circle-label-background-fill);
  stroke: var(--exf-graph-circle-label-background-stroke);
  stroke-width: 2;
`

export const nodeCircleLabelText = css`
  label: node-circle-label-text;
  font-family: var(--exf-graph-font);
  font-size: var(--exf-graph-circle-label-font-size);
  font-weight: var(--exf-graph-circle-label-font-weight);
  fill: var(--exf-graph-circle-label-fill);
  text-anchor: middle;
`
