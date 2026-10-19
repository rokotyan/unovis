export const DEFAULT_TRANSITION_DURATION = 250

export enum TransitionState {
  Created,
  Scheduled,
  Starting,
  Started,
  Running,
  Ending,
  Ended,
}

export const TRANSITION_EVENTS = ['start', 'end', 'cancel', 'interrupt'] as const
