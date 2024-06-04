import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VisSingleContainer, VisGraph, VisGraphRef } from '@unovis/react'
import { select, Selection } from 'd3-selection'
import { Graph, getNumber, getColor, getString, type ColorAccessor, type GraphConfigInterface, type GraphNode, type StringAccessor } from '@unovis/ts'

import identityIcon from './icons/identity-user.svg?raw';
import networkIcon from './icons/network-interface.svg?raw';
import resourceIcon from './icons/resource-file.svg?raw';
import computeIcon from './icons/compute.svg?raw';
import secretIcon from './icons/secret-key.svg?raw';
import starIcon from './icons/star.svg?raw';

import * as s from './styles'
import { DEFAULT_CIRCLE_LABEL_SIZE, DEFAULT_NODE_SIZE, NODE_STAR_ICON_ID } from './constants'
import type { ExaforceGraphLink, ExaforceGraphNode } from './types'

export const nodeSvgDefs = `
  ${identityIcon}
  ${networkIcon}
  ${resourceIcon}
  ${computeIcon}
  ${secretIcon}
  ${starIcon}
`;

export const nodeEnterCustomRenderFunction = <
  N extends ExaforceGraphNode,
  L extends ExaforceGraphLink,
>(
  d: GraphNode<N, L>,
  nodeGroupElement: SVGGElement,
  config: GraphConfigInterface<N, L>
) => {
  const g = select(nodeGroupElement)

  // Node Circle and Icon
  g.append('circle').attr('class', s.nodeSelectionBackground)
  g.append('circle').attr('class', s.nodeHighlightBackground)
  g.append('circle').attr('class', s.nodeCircle)
  g.append('use').attr('class', s.nodeIcon)

  // Node Aggregation
  g.append('rect').attr('class', s.nodeAggregationBackground)
    .classed(s.nodeCircleLabelBackground, true)
  g.append('text').attr('class', s.nodeAggregationText)
    .classed(s.nodeCircleLabelText, true)

  // Node Session Count
  g.append('rect').attr('class', s.nodeSessionCountBackground)
  .classed(s.nodeCircleLabelBackground, true)
g.append('text').attr('class', s.nodeSessionCountText)
  .classed(s.nodeCircleLabelText, true)

  // Node Watchlist
  g.append('circle').attr('class', s.nodeWatchlistBackground)
    .classed(s.nodeCircleLabelBackground, true)
  g.append('use').attr('class', s.nodeWatchlistIcon)

  // Node Alerts
  // g.append('g').attr('class', s.nodeAlerts)

  // Node Enrichments
  g.append('g').attr('class', s.nodeEnrichments)
}

export const nodeUpdateCustomRenderFunction = <
  N extends ExaforceGraphNode,
  L extends ExaforceGraphLink,
>(
  d: GraphNode<N, L>,
  nodeGroupElement: SVGGElement,
  config: GraphConfigInterface<N, L>
) => {
  const nodeSize = getNumber(d, config.nodeSize, d._index) ?? DEFAULT_NODE_SIZE
  const nodeIconSize = getNumber(d, config.nodeIconSize, d._index) ?? 2.5 * Math.sqrt(nodeSize)
  const nodeIconColor = getColor(d, config.nodeFill, d._index) ?? 'black'
  const nodeCircleLabelPlacementDistance = 1.2 * nodeSize

  const g = select<SVGGElement, GraphNode<N, L>>(nodeGroupElement)
  console.log('d', d)
  const circle = g.select<SVGCircleElement>('circle')
    .attr('r', nodeSize)
    .attr('fill', getColor(d, config.nodeFill, d._index))

  const icon = g.select<SVGUseElement>('use')
    .attr('href', getString(d, config.nodeIcon as StringAccessor<N>, d._index) as string)
    .attr('x', -nodeIconSize / 2)
    .attr('y', -nodeIconSize / 2)
    .attr('width', nodeIconSize)
    .attr('height', nodeIconSize)
    .style('fill', nodeIconColor)

  // Node Aggregation
  const aggregationPos = [nodeCircleLabelPlacementDistance * Math.cos(Math.PI/4), -nodeCircleLabelPlacementDistance * Math.sin(Math.PI/4)]
  const aggregationText = g.select<SVGTextElement>(`.${s.nodeAggregationText}`)
    .attr('x', aggregationPos[0])
    .attr('y', aggregationPos[1])
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .text(d.aggregation?.length ?? '')
    .attr('visibility', d.aggregation?.length ? null : 'hidden')

  const aggregationBackground = g.select<SVGRectElement>(`.${s.nodeAggregationBackground}`)
    .attr('width', DEFAULT_CIRCLE_LABEL_SIZE * 2)
    .attr('height', DEFAULT_CIRCLE_LABEL_SIZE * 2)
    .attr('rx', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('ry', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('x', aggregationPos[0])
    .attr('y', aggregationPos[1])
    .attr('transform', `translate(${-DEFAULT_CIRCLE_LABEL_SIZE}, ${-DEFAULT_CIRCLE_LABEL_SIZE})`)
    .attr('visibility', d.aggregation?.length ? null : 'hidden')

  // Node Session Count
  const sessionCountPos = [nodeCircleLabelPlacementDistance, 0]
  const numSessionsText = d.numSessions?.toString() ?? ''
  const sessionCountBackgroundWidth = Math.max(numSessionsText.length * 7.5, DEFAULT_CIRCLE_LABEL_SIZE * 2)
  const sessionCountText = g.select<SVGTextElement>(`.${s.nodeSessionCountText}`)
    .attr('x', sessionCountPos[0] + sessionCountBackgroundWidth / 2 - DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('y', sessionCountPos[1])
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .text(d.numSessions ?? '')
    .attr('visibility', d.numSessions ? null : 'hidden')

  const sessionCountBackground = g.select<SVGRectElement>(`.${s.nodeSessionCountBackground}`)
    .attr('width', sessionCountBackgroundWidth)
    .attr('height', DEFAULT_CIRCLE_LABEL_SIZE * 2)
    .attr('rx', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('ry', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('x', sessionCountPos[0])
    .attr('y', sessionCountPos[1])
    .attr('transform', `translate(${-DEFAULT_CIRCLE_LABEL_SIZE}, ${-DEFAULT_CIRCLE_LABEL_SIZE})`)
    .attr('visibility', d.numSessions ? null : 'hidden')


  // Node Watchlist
  const watchlistPos = [nodeCircleLabelPlacementDistance * Math.cos(-Math.PI/4), -nodeCircleLabelPlacementDistance * Math.sin(-Math.PI/4)]
  const watchlistIcon = g.select<SVGUseElement>(`.${s.nodeWatchlistIcon}`)
    .attr('href', '#' + NODE_STAR_ICON_ID)
    .attr('x', watchlistPos[0] - DEFAULT_CIRCLE_LABEL_SIZE / 2)
    .attr('y', watchlistPos[1] - DEFAULT_CIRCLE_LABEL_SIZE / 2)
    .attr('width', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('height', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('visibility', d.starred ? null : 'hidden')

  const watchlistBackground = g.select<SVGCircleElement>(`.${s.nodeWatchlistBackground}`)
    .attr('r', DEFAULT_CIRCLE_LABEL_SIZE)
    .attr('cx', watchlistPos[0])
    .attr('cy', watchlistPos[1])
    .attr('visibility', d.starred ? null : 'hidden')


  // Node Alerts
  const alertsData = Object.entries(d.numAlerts ?? {}).filter(([_, v]) => v > 0)
  const alerts = g.selectAll<SVGGElement, [string, number]>(`.${s.nodeAlert}`).data(alertsData)

  const alertsEnter = alerts.enter().append('g').attr('class', s.nodeAlert)
  alertsEnter.append('circle')
    .attr('class', s.nodeAlertBackground)
    .classed(s.nodeCircleLabelBackground, true)
    .attr('r', DEFAULT_CIRCLE_LABEL_SIZE)
    .style('fill', ([severity]) => {
      switch (severity) {
        case 'low': return 'var(--exf-severity-low)'
        case 'medium': return 'var(--exf-severity-medium)'
        case 'high': return 'var(--exf-severity-high)'
        case 'critical': return 'var(--exf-severity-critical)'
        default: return 'black'
      }
    })

    alertsEnter
    .append('text')
    .attr('dy', '0.35em')
    .attr('class', s.nodeAlertText)
    .classed(s.nodeCircleLabelText, true)

    alertsEnter.merge(alerts)
    .attr('transform', (l, j) => {
      const r = nodeCircleLabelPlacementDistance
      const i = alertsData.length - j - 1
      const angle =  - Math.PI / 1.4 - i * 1.15 * 2 * Math.atan2(DEFAULT_CIRCLE_LABEL_SIZE, r)
      return `translate(${r * Math.cos(angle)}, ${r * Math.sin(angle)})`
    })
    .select('text').text(([,count]) => count)

    alerts.exit().remove()
}

// export const updateNodeCircle = (
//   circle: Selection<SVGCircleElement, GraphNode<N, L>, null, unknown>,
//   config: GraphConfigInterface<N, L>,
// ) => {
//   circle
//     .attr('r', d => getNumber(d, config.nodeSize, d._index) ?? 15)
//     .attr('fill', 'blue')
// }

