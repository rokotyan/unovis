import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VisSingleContainer, VisGraph, VisGraphRef } from '@unovis/react'
import { select } from 'd3-selection'
import { Graph, type GraphNode } from '@unovis/ts'
import { generateNodeLinkData, NodeDatum, LinkDatum } from '@src/utils/data'

export const title = 'Graph: Custom Nodes'
export const subTitle = 'User provided rendering functions'

export const component = (): JSX.Element => {
  const data = useMemo(() => generateNodeLinkData(), [])

  const nodeEnterCustomRenderFunction = useCallback((d: GraphNode<NodeDatum, LinkDatum>, nodeGroupElement: SVGGElement) => {
    const g = select(nodeGroupElement)
    g.append('circle')
      .attr('r', 0)
      .attr('fill', 'red')
  }, [])

  const nodeUpdateCustomRenderFunction = useCallback((d: GraphNode<NodeDatum, LinkDatum>, nodeGroupElement: SVGGElement) => {
    const g = select(nodeGroupElement)
    console.log('d', d)
    const circle = g.select<SVGCircleElement>('circle')
      .transition()
      .duration(1000)
      .attr('r', 20)
      .attr('fill', 'blue')
  }, [])

  return (
    <>
      <VisSingleContainer data={data} height={600}>
        <VisGraph
        nodeEnterCustomRenderFunction={nodeEnterCustomRenderFunction}
        nodeUpdateCustomRenderFunction={nodeUpdateCustomRenderFunction}
        />
      </VisSingleContainer>

    </>
  )
}

