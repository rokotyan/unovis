/*!
 * Scheduling adapted from d3-transition, Copyright 2010-2021 Mike Bostock.
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose
 * with or without fee is hereby granted, provided that the above copyright notice
 * and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
 * OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
 * TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
 * THIS SOFTWARE.
 */
import { now, timer, timeout } from 'd3-timer'
import { easeCubicInOut } from 'd3-ease'
import type { ArrayLike as D3ArrayLike, BaseType } from 'd3-selection'

import { DEFAULT_TRANSITION_DURATION, TransitionState } from './constants'
import type { TransitionEvent, TransitionSchedule, TransitionTick, TransitionTiming } from './types'

const schedules = new WeakMap<NonNullable<BaseType>, Map<number, TransitionSchedule>>()
let nextId = 0

export function createTransitionId (): number {
  return ++nextId
}

export function defaultTransitionTiming (): TransitionTiming {
  return { time: now(), duration: DEFAULT_TRANSITION_DURATION, ease: easeCubicInOut }
}

export function getTransitionSchedule (node: BaseType, id: number): TransitionSchedule {
  const schedule = node && schedules.get(node)?.get(id)
  if (!schedule) throw new Error('transition not found')
  return schedule
}

export function inheritTransitionTiming (node: BaseType, id: number): TransitionTiming {
  while (node) {
    const schedule = schedules.get(node)?.get(id)
    if (schedule) return schedule
    node = (node as Node).parentNode as BaseType
  }
  throw new Error(`transition ${id} not found`)
}

function dispatch (schedule: TransitionSchedule, event: TransitionEvent): void {
  const datum = (schedule.node as BaseType & Record<string, unknown>).__data__
  const listeners = [...(schedule.listeners.get(event)?.values() ?? [])]
  listeners.forEach(listener => listener.call(schedule.node, datum, schedule.index, schedule.group))
}

function stop (schedule: TransitionSchedule): void {
  schedule.state = TransitionState.Ended
  schedule.timer.stop()
  const nodeSchedules = schedules.get(schedule.node)
  nodeSchedules?.delete(schedule.id)
  if (!nodeSchedules?.size) schedules.delete(schedule.node)
}

export function interrupt (node: BaseType, name: string | null = null): void {
  const nodeSchedules = node && schedules.get(node)
  if (!nodeSchedules) return
  for (const schedule of [...nodeSchedules.values()]) {
    if (schedule.name !== name) continue
    const active = schedule.state > TransitionState.Starting && schedule.state < TransitionState.Ending
    schedule.state = TransitionState.Ended
    schedule.timer.stop()
    dispatch(schedule, active ? 'interrupt' : 'cancel')
    stop(schedule)
  }
}

export function removeTransitionNode (schedule: TransitionSchedule): void {
  if (schedules.get(schedule.node)?.size === 1) (schedule.node as Element).remove()
}

export function scheduleTransition (
  node: NonNullable<BaseType>,
  id: number,
  name: string | null,
  index: number,
  group: any[] | D3ArrayLike<any>,
  timing: TransitionTiming
): void {
  let nodeSchedules = schedules.get(node)
  if (nodeSchedules?.has(id)) return
  if (!nodeSchedules) schedules.set(node, (nodeSchedules = new Map()))

  const schedule: TransitionSchedule = {
    id,
    name,
    node,
    index,
    group,
    time: timing.time,
    duration: timing.duration,
    ease: timing.ease,
    state: TransitionState.Created,
    timer: undefined,
    tweens: new Map(),
    listeners: new Map(),
  }
  nodeSchedules.set(id, schedule)
  let ticks: TransitionTick[] = []

  const tick = (elapsed: number): void => {
    const ending = !(elapsed < schedule.duration)
    const progress = ending ? 1 : schedule.ease.call(null, elapsed / schedule.duration)
    if (ending) {
      schedule.state = TransitionState.Ending
      schedule.timer.restart(() => stop(schedule))
    }
    ticks.forEach(tween => tween.call(node, progress))
    if (schedule.state === TransitionState.Ending) {
      dispatch(schedule, 'end')
      stop(schedule)
    }
  }

  const start = (elapsed: number): void => {
    if (schedule.state !== TransitionState.Scheduled) return stop(schedule)
    for (const previous of [...nodeSchedules.values()]) {
      if (previous.name !== name) continue
      if (previous.state === TransitionState.Started) {
        timeout(start)
        return
      }
      if (previous.state === TransitionState.Running || previous.id < id) {
        const event = previous.state === TransitionState.Running ? 'interrupt' : 'cancel'
        previous.state = TransitionState.Ended
        previous.timer.stop()
        dispatch(previous, event)
        stop(previous)
      }
    }

    timeout(() => {
      if (schedule.state !== TransitionState.Started) return
      schedule.state = TransitionState.Running
      schedule.timer.restart(tick, 0, schedule.time)
      tick(elapsed)
    })
    schedule.state = TransitionState.Starting
    dispatch(schedule, 'start')
    if (schedule.state !== TransitionState.Starting) return
    schedule.state = TransitionState.Started
    const datum = (node as BaseType & Record<string, unknown>).__data__
    ticks = [...schedule.tweens.values()]
      .map(factory => factory.call(node, datum, index, group))
      .filter((tween): tween is TransitionTick => Boolean(tween))
  }

  schedule.timer = timer(elapsed => {
    schedule.state = TransitionState.Scheduled
    schedule.timer.restart(start, 0, schedule.time)
    start(elapsed)
  }, 0, schedule.time)
}
