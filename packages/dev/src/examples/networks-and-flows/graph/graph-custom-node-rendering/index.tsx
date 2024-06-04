import React, { useMemo } from 'react'
import { generateNodeLinkData } from '@src/utils/data'
import { ExaforceGraph } from './component'
import { ExaforceGraphNodeType } from './enums'
import type { ExaforceGraphLink, ExaforceGraphNode } from './types'

export const title = 'Graph: Custom Nodes'
export const subTitle = 'User provided rendering functions'

export const component = (): JSX.Element => {
  const nodes: ExaforceGraphNode[] = [
    {
      id: '0',
      type: ExaforceGraphNodeType.Identity,
      subLabel: 'External User',
      label: 'jdoe@acme.com',
      aggregation: [{}, {}],
      numFindings: { medium: 12, high: 3, critical: 1 },
      starred: true,
      numSessions: 150,
      status: ['admin', 'high-data-access'],
    },
    { id: '1', type: ExaforceGraphNodeType.Identity, subLabel: 'Role', label: 'AWSReservedSSO_Something' },
    { id: '2', type: ExaforceGraphNodeType.Network, subLabel: 'EC2 Instance', label: 'i-0a1b2c3d4e5f6g7h8' },
    { id: '3', type: ExaforceGraphNodeType.Network, subLabel: 'EC2 Instance', label: 'i-1a1b2c3d4e5f6g7h8' },
    { id: '4', type: ExaforceGraphNodeType.Resource, subLabel: 'File', label: 'my-file' },
    { id: '5', type: ExaforceGraphNodeType.Secret, subLabel: 'Secret', label: 'tests-ansible-ssm-file-transfer' },
  ]

  const links: ExaforceGraphLink[] = [
    { source: '0', target: '1' },
    { source: '0', target: '2' },
    { source: '0', target: '3' },
    { source: '0', target: '4' },
    { source: '1', target: '5' },
  ]

  return (
    <ExaforceGraph nodes={nodes} links={links} zoomScaleExtent={[0.25, 2]} height={'80vh'}/>
  )
}

