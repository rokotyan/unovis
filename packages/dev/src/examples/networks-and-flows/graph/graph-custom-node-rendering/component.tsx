import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { cx } from '@emotion/css';
import { VisSingleContainer, VisGraph, VisGraphRef, type VisSingleContainerProps, type VisGraphProps } from '@unovis/react'
import { select } from 'd3-selection'
import { Graph, type GraphNode } from '@unovis/ts'
import { generateNodeLinkData, NodeDatum, LinkDatum } from '@src/utils/data'
import { nodeEnterCustomRenderFunction, nodeSvgDefs, nodeUpdateCustomRenderFunction } from './node-rendering'
import { DEFAULT_NODE_SIZE, nodeTypeColorMap, nodeTypeIconMap } from './constants'
import type { ExaforceGraphNodeType } from './enums'

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

  return (
      <VisSingleContainer
        className={cx(s.exaforceGraph, props.className)}
        svgDefs={nodeSvgDefs}
        data={data}
        height={props.height}
      >
        <VisGraph<N, L>
          layoutType={'dagre'}
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
          {...props}
        />
      </VisSingleContainer>
  );
};
