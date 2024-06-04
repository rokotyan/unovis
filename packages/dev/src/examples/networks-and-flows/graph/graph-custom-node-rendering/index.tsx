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
      id: 'jdoe@acme.com',
      type: ExaforceGraphNodeType.Identity,
      label: 'External User',
      subLabel: 'jdoe@acme.com',
      aggregation: [{}, {}],
      numAlerts: { low: 5, medium: 12, high: 3, critical: 1 },
      starred: true,
      numSessions: 150,
    },
    // { id: 'AWSReservedSSO_Something', type: ExaforceGraphNodeType.Identity, label: 'Role', subLabel: 'AWSReservedSSO_Something' },
    { id: 'i-0a1b2c3d4e5f6g7h8', type: ExaforceGraphNodeType.Network, label: 'EC2 Instance', subLabel: 'i-0a1b2c3d4e5f6g7h8' },
    { id: 'i-1a1b2c3d4e5f6g7h8', type: ExaforceGraphNodeType.Network, label: 'EC2 Instance', subLabel: 'i-1a1b2c3d4e5f6g7h8' },
    { id: 'my-file', type: ExaforceGraphNodeType.Resource, label: 'File', subLabel: 'my-file' },
    { id: 'tests-ansible-ssm-file-transfer', type: ExaforceGraphNodeType.Secret, label: 'Secret', subLabel: 'tests-ansible-ssm-file-transfer' },
  ]

  const links: ExaforceGraphLink[] = [
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 0, target: 3 },
    { source: 0, target: 4 },
    // { source: 1, target: 5 },
  ]
  return (
    <ExaforceGraph nodes={nodes} links={links} zoomScaleExtent={[0.25, 2]} height={'80vh'}/>
  )
}

