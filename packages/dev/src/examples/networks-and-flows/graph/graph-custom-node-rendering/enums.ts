export enum ExaforceGraphNodeType {
  Identity = 'identity',
  Network = 'network',
  Resource = 'resource',
  Compute = 'compute',
  Secret = 'secret',
  Finding = 'finding',
  ThreatActor = 'threat-actor',
}

export enum ExaforceGraphNodeStatus {
  Admin = 'admin',
  Crown = 'crown',
  Public = 'public',
  HighDataAccess = 'high-data-access',
}
