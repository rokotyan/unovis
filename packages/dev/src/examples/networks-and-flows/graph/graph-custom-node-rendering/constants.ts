import { ExaforceGraphNodeType } from './enums'

export const DEFAULT_NODE_SIZE = 20
export const DEFAULT_CIRCLE_LABEL_SIZE = 7
export const NODE_STAR_ICON_ID = 'starIcon' // TODO: Find a way to set it dimamically

export const nodeTypeIconMap = new Map<ExaforceGraphNodeType, string>([
  [ExaforceGraphNodeType.Identity, '#identityIcon'], /* The icon ids come from SVG icon files */
  [ExaforceGraphNodeType.Network, '#networkIcon'],
  [ExaforceGraphNodeType.Resource, '#resourceIcon'],
  [ExaforceGraphNodeType.Compute, '#computeIcon'],
  [ExaforceGraphNodeType.Secret, '#secretIcon'],
  [ExaforceGraphNodeType.Finding, '#findingIcon'],
  [ExaforceGraphNodeType.ThreatActor, '#threatActorIcon'],
])

export const nodeTypeColorMap = new Map<ExaforceGraphNodeType, string>([
  [ExaforceGraphNodeType.Identity, 'var(--exf-graph-node-identity)'],
  [ExaforceGraphNodeType.Network, 'var(--exf-graph-node-network)'],
  [ExaforceGraphNodeType.Resource, 'var(--exf-graph-node-resource)'],
  [ExaforceGraphNodeType.Compute, 'var(--exf-graph-node-compute)'],
  [ExaforceGraphNodeType.Secret, 'var(--exf-graph-node-secret)'],
  [ExaforceGraphNodeType.Finding, 'var(--exf-graph-node-finding)'],
  [ExaforceGraphNodeType.ThreatActor, 'var(--exf-graph-node-threat-actor)'],
])

