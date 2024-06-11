import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { cx } from '@emotion/css';
import { VisSingleContainer, VisGraph, VisGraphRef, type VisSingleContainerProps, type VisGraphProps } from '@unovis/react'
import { nodeEnterCustomRenderFunction, nodeSvgDefs, nodeUpdateCustomRenderFunction } from './node-rendering'
import { DEFAULT_NODE_SIZE, nodeTypeColorMap, nodeTypeIconMap } from './constants'
import type { ExaforceGraphNodeType } from './enums'
import { Selection } from 'd3-selection'
import { GraphNode, GraphLink, GraphConfigInterface, Graph, getTransformValues } from '@unovis/ts'
import { group, max, min, mean } from 'd3-array'

import './font.css';
import * as s from './styles';
import type { ExaforceGraphLink, ExaforceGraphNode, UnovisGraphLink } from './types'

export type ExaforceGraphProps<
  N extends ExaforceGraphNode,
  L extends ExaforceGraphLink,
> = VisSingleContainerProps<{ links: L; nodes: N}> & VisGraphProps<N, L> & {
  links: L[];
  nodes: N[];
  onBackgroundClick?: (event: MouseEvent) => void;
  onLinkClick?: (link: L, event: MouseEvent, i: number) => void;
  onNodeClick?: (node: N, event: MouseEvent, i: number) => void;
};

export const ExaforceGraph = <N extends ExaforceGraphNode, L extends ExaforceGraphLink>(
  props: ExaforceGraphProps<N, L>
): ReactElement => {
  const graphD3SelectionRef = useRef<Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const getNodeIcon = useCallback((n: N) => {
    return nodeTypeIconMap.get(n.type as ExaforceGraphNodeType);
  }, []);

  const getNodeFillColor = useCallback((n: N) => {
    return n.fillColor ?? nodeTypeColorMap.get(n.type as ExaforceGraphNodeType);
  }, []);

  const data = useMemo(() => ({
    nodes: props.nodes,
    links: props.links,
  }), [props.nodes, props.links]);

  const onRenderComplete = (
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: GraphNode<ExaforceGraphNode, ExaforceGraphLink>[],
    links: GraphLink<ExaforceGraphNode, ExaforceGraphLink>[],
    config: GraphConfigInterface<ExaforceGraphNode, ExaforceGraphLink>,
    duration: number,
    zoomLevel: number
  ): void => {
    graphD3SelectionRef.current = g

    const maxY = max(nodes, d => d.y) as number
    const nodesGrouped = group(nodes, d => d.type)
    const largeSvgNumber = 9999
    const swimlanes = Array.from(nodesGrouped.entries()).map(([key, nodes], i) => ({
      index: i,
      label: key,
      xCenter: mean(nodes, (d: GraphNode<ExaforceGraphNode, ExaforceGraphLink>) => d.x) as number,
      x1: 0,
      x2: 0,
    }))

    for (const [i, lane] of swimlanes.entries()) {
      switch (i) {
        case 0:
          lane.x1 = -largeSvgNumber
          lane.x2 = (lane.xCenter + swimlanes[i + 1].xCenter) / 2
          break
        case swimlanes.length - 1:
          lane.x1 = (lane.xCenter + swimlanes[i - 1].xCenter) / 2
          lane.x2 = largeSvgNumber
          break
        default:
          lane.x1 = (lane.xCenter + swimlanes[i - 1].xCenter) / 2
          lane.x2 = (lane.xCenter + swimlanes[i + 1].xCenter) / 2
          break
      }
    }

    // Rendering
    const svgGraph = g.select(`.${Graph.selectors.graphGroup}`)
    const svgGraphTransform = getTransformValues(svgGraph.node())
    console.log(svgGraphTransform)

    const svgSwimlanes = g.selectAll(`.${s.swimlane}`)
      .data(swimlanes)

    const svgSwimlanesEnter = svgSwimlanes.enter()
      .insert('g', ':first-child')
      .attr('class', s.swimlane)

    svgSwimlanes.merge(svgSwimlanesEnter)
      .attr('transform', `translate(${svgGraphTransform.translate.x}, 0)`)
    svgSwimlanes.exit().remove()

    svgSwimlanesEnter.append('rect')
      .attr('class', s.swimlaneRect)
      .attr('x', lane => lane.x1)
      .attr('width', lane => lane.x2 - lane.x1)
      .attr('y', -largeSvgNumber)
      .attr('height', largeSvgNumber * 2)
      .style('fill', (_, i) => i%2 ? '#eee5' : '#eee2')

    svgSwimlanesEnter.append('text')
      .attr('class', s.swimlaneLabel)
      .text(lane => lane.label)
      .attr('y', '97%')

    updateSwimlanes(g)
  }

  const updateSwimlanes = (g: Selection<SVGGElement, unknown, null, undefined>): void => {
    const svgGraph = g.select(`.${Graph.selectors.graphGroup}`)
    const svgGraphTransform = getTransformValues(svgGraph.node())

    g.selectAll(`.${s.swimlane}`)
      .attr('transform', `translate(${svgGraphTransform.translate.x}, 0) scale(${svgGraphTransform.scale.x}, 1)`)

    g.selectAll(`.${s.swimlaneLabel}`)
      .attr('transform', d => `scale(${1/svgGraphTransform.scale.x}, 1) translate(${d.xCenter * svgGraphTransform.scale.x}, 0)`)
  }

  const onZoom = (): void => {
    if (graphD3SelectionRef.current) {
      updateSwimlanes(graphD3SelectionRef.current)
    }
  }

  return (
      <VisSingleContainer
        className={cx(s.exaforceGraph, props.className)}
        svgDefs={nodeSvgDefs}
        data={data}
        height={props.height}
      >
        <VisGraph<N, L>
          layoutType={'parallel'}
          layoutNodeGroup={useCallback((n: N) => n.type, [])}
          linkArrow={useCallback((l: L) => l.showArrow, [])}
          linkBandWidth={useCallback((l: L) => l.bandWidth, [])}
          linkCurvature={1}
          linkFlow={useCallback((l: L) => l.showFlow, [])}
          linkWidth={useCallback((l: L) => l.width, [])}
          nodeFill={getNodeFillColor}
          nodeIcon={getNodeIcon}
          nodeSize={DEFAULT_NODE_SIZE}
          nodeIconSize={DEFAULT_NODE_SIZE}
          nodeLabel={useCallback((n: N) => n.label, [])}
          nodeLabelTrimLength={30}
          nodeStroke={'none'}
          nodeSubLabel={useCallback((n: N) => n.subLabel, [])}
          nodeSubLabelTrimLength={30}
          nodeEnterCustomRenderFunction={nodeEnterCustomRenderFunction}
          nodeUpdateCustomRenderFunction={nodeUpdateCustomRenderFunction}
          onRenderComplete={onRenderComplete}
          onZoom={onZoom}
          {...props}
        />
      </VisSingleContainer>
  );
};
