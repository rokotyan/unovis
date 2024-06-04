import { GraphCircleLabel, GraphDagreLayoutSetting, GraphForceLayoutSettings, GraphInputLink, GraphInputNode, GraphLink, GraphNode } from '@unovis/ts'

import { ExaforceGraphNodeType } from './enums'

export type ExaforceGraphData<
  N extends ExaforceGraphNode = ExaforceGraphNode,
  L extends ExaforceGraphLink = ExaforceGraphLink,
> = {
  links: L[];
  nodes: N[];
};

export type ExaforceGraphNode<Datum = unknown> = {
  id: string;
  datum?: Datum;
  fillColor?: string;
  label?: string;
  subLabel?: string;
  type?: ExaforceGraphNodeType;
  aggregation?: ExaforceGraphNode<Datum>[];
  numFindings?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  numSessions?: number;
  starred?: boolean;
  highlighted?: boolean;
  status?: ('admin' | 'crown' | 'public' | 'high-data-access' | 'eof' | 'egress' | 'ingress')[];
};

export type ExaforceGraphLink<Datum = unknown> = {
  source: string;
  target: string;
  bandWidth?: number;
  datum?: Datum;
  id?: string;
  label?: string;
  showArrow?: boolean;
  showFlow?: boolean;
  width?: number;
};

export type UnovisGraphNode<T extends GraphInputNode> = GraphNode<T>;
export type UnovisGraphLink<T extends GraphInputLink> = GraphLink<T>;
export type UnovisGraphCircleLabel = GraphCircleLabel;

export type ExaforceGraphForceLayoutSettings = GraphForceLayoutSettings<ExaforceGraphNode, ExaforceGraphLink>;
export type ExaforceGraphDagreLayoutSettings = GraphDagreLayoutSetting;
