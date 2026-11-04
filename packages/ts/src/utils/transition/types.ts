import type { ArrayLike as D3ArrayLike, BaseType, ValueFn } from 'd3-selection'
import type { Timer } from 'd3-timer'

import type { TransitionState, TRANSITION_EVENTS } from './constants'

export type TransitionEvent = typeof TRANSITION_EVENTS[number]
export type TransitionTick = (this: any, progress: number) => void
export type TransitionTween = ValueFn<any, any, TransitionTick | null | void>
export type TransitionListener = ValueFn<any, any, void>
export type TransitionValue<GElement extends BaseType, Datum, Value> = Value | ValueFn<GElement, Datum, Value>

export interface TransitionTiming {
  time: number;
  duration: number;
  ease: (progress: number) => number;
}

export interface TransitionSchedule extends TransitionTiming {
  id: number;
  name: string | null;
  node: NonNullable<BaseType>;
  index: number;
  group: any[] | D3ArrayLike<any>;
  state: TransitionState;
  timer: Timer;
  tweens: Map<string, TransitionTween>;
  listeners: Map<TransitionEvent, Map<string, TransitionListener>>;
}
