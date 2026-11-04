import { color } from 'd3-color'
import { interpolateNumber, interpolateRgb, interpolateString, interpolateTransformCss, interpolateTransformSvg } from 'd3-interpolate'
import { namespace, selection as selectionPrototype, style as getStyle } from 'd3-selection'
import type { BaseType, Selection, ValueFn } from 'd3-selection'

// Utils
import { isFunction, isNumber, isString } from '@/utils/data'

import { TRANSITION_EVENTS, TransitionState } from './constants'
import {
  createTransitionId,
  defaultTransitionTiming,
  getTransitionSchedule,
  inheritTransitionTiming,
  removeTransitionNode,
  scheduleTransition,
} from './schedule'
import type { TransitionEvent, TransitionListener, TransitionSchedule, TransitionTween, TransitionValue } from './types'

export { interrupt } from './schedule'

function interpolateValue (from: string, to: string | number | boolean): (progress: number) => string | number {
  if (isNumber(to)) return interpolateNumber(+from, to)
  const targetColor = color(`${to}`)
  return targetColor ? interpolateRgb(from, targetColor) : interpolateString(from, `${to}`)
}

function editableSchedule (node: BaseType, id: number, state = TransitionState.Started): TransitionSchedule {
  const schedule = getTransitionSchedule(node, id)
  if (schedule.state > state) throw new Error(state === TransitionState.Created ? 'too late; already scheduled' : 'too late; already running')
  return schedule
}

export class Transition<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
  static create<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
    selection: Selection<GElement, Datum, PElement, PDatum>,
    name: string | Transition<any, any, any, any> | null = null
  ): Transition<GElement, Datum, PElement, PDatum> {
    const inherited = name instanceof Transition
    const id = inherited ? name.id : createTransitionId()
    const transitionName = inherited ? name.name : name
    const timing = inherited ? undefined : defaultTransitionTiming()
    selection.each(function (d, i, group) {
      scheduleTransition(this, id, transitionName, i, group, timing ?? inheritTransitionTiming(this, id))
    })
    return new Transition(selection, id, transitionName)
  }

  constructor (
    private readonly _selection: Selection<GElement, Datum, PElement, PDatum>,
    public readonly id: number,
    public readonly name: string | null
  ) {}

  selection (): Selection<GElement, Datum, PElement, PDatum> {
    return this._selection
  }

  each (callback: ValueFn<GElement, Datum, void>): this {
    this._selection.each(callback)
    return this
  }

  call (callback: (...args: any[]) => unknown, ...args: any[]): this {
    // D3 Axis calls selection.transition(context) on the selections it creates. A local
    // facade lets it inherit our timing without changing D3's global selection prototype.
    function axisSelection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
      selection: Selection<GElement, Datum, PElement, PDatum>
    ): Selection<GElement, Datum, PElement, PDatum> {
      return new Proxy(selection, {
        get (target, property) {
          if (property === 'transition') return (context: Transition<GElement, Datum, PElement, PDatum>) => Transition.create(target, context)
          const value = Reflect.get(target, property)
          if (!isFunction(value)) return value
          return (...args: unknown[]) => {
            const result = value.apply(target, args)
            return result instanceof selectionPrototype ? axisSelection(result as Selection<any, any, any, any>) : result
          }
        },
      })
    }
    const context = new Proxy(this, {
      get: (target, property) => property === 'selection' ? () => axisSelection(target.selection()) : Reflect.get(target, property),
    })
    callback(context, ...args)
    return this
  }

  node (): GElement | null {
    return this._selection.node()
  }

  select<DescElement extends BaseType> (selector: string): Transition<DescElement, Datum, PElement, PDatum> {
    return Transition.create(this._selection.select<DescElement>(selector), this)
  }

  selectAll<DescElement extends BaseType, DescDatum> (selector: string): Transition<DescElement, DescDatum, GElement, Datum> {
    return Transition.create(this._selection.selectAll<DescElement, DescDatum>(selector), this)
  }

  filter (filter: string | ValueFn<GElement, Datum, boolean>): Transition<GElement, Datum, PElement, PDatum> {
    const selection = isString(filter) ? this._selection.filter(filter) : this._selection.filter(filter)
    return new Transition(selection, this.id, this.name)
  }

  duration (): number
  duration (value: TransitionValue<GElement, Datum, number>): this
  duration (value?: TransitionValue<GElement, Datum, number>): number | this {
    if (!arguments.length) return getTransitionSchedule(this.node(), this.id).duration
    const id = this.id
    return this.each(function (d, i, group) {
      editableSchedule(this, id).duration = +(isFunction(value) ? value.call(this, d, i, group) : value)
    })
  }

  ease (): (progress: number) => number
  ease (value: (progress: number) => number): this
  ease (value?: (progress: number) => number): ((progress: number) => number) | this {
    if (!arguments.length) return getTransitionSchedule(this.node(), this.id).ease
    if (!isFunction(value)) throw new Error('invalid easing')
    const id = this.id
    return this.each(function () { editableSchedule(this, id).ease = value })
  }

  tween (name: string): TransitionTween | null
  tween (name: string, factory: TransitionTween | null): this
  tween (name: string, factory?: TransitionTween | null): TransitionTween | null | this {
    if (arguments.length < 2) return getTransitionSchedule(this.node(), this.id).tweens.get(name) ?? null
    if (factory != null && !isFunction(factory)) throw new Error('invalid tween')
    const id = this.id
    return this.each(function () {
      const tweens = editableSchedule(this, id).tweens
      if (factory == null) tweens.delete(name)
      else tweens.set(name, factory)
    })
  }

  on (typenames: string): TransitionListener | undefined
  on (typenames: string, listener: TransitionListener | null): this
  on (typenames: string, listener?: TransitionListener | null): TransitionListener | undefined | this {
    const names = typenames.trim().split(/\s+/).map(name => {
      const index = name.indexOf('.')
      const type = (index < 0 ? name : name.slice(0, index)) as TransitionEvent
      if (type && !TRANSITION_EVENTS.includes(type)) throw new Error(`unknown type: ${type}`)
      return { type, namespace: index < 0 ? '' : name.slice(index + 1) }
    })
    if (arguments.length < 2) {
      const schedule = getTransitionSchedule(this.node(), this.id)
      for (const { type, namespace } of names) {
        const listener = schedule.listeners.get(type)?.get(namespace)
        if (listener) return listener
      }
      return undefined
    }
    if (listener != null && !isFunction(listener)) throw new Error('invalid listener')
    const id = this.id
    const state = names.every(({ type }) => !type || type === 'start') ? TransitionState.Created : TransitionState.Started
    return this.each(function () {
      const schedule = editableSchedule(this, id, state)
      for (const { type, namespace } of names) {
        const types = type ? [type] : TRANSITION_EVENTS
        for (const event of types) {
          if (!schedule.listeners.has(event)) schedule.listeners.set(event, new Map())
          const listeners = schedule.listeners.get(event)
          if (listener == null) listeners.delete(namespace)
          else if (type) {
            listeners.delete(namespace)
            listeners.set(namespace, listener)
          }
        }
      }
    })
  }

  attr (name: string, value: TransitionValue<GElement, Datum, string | number | boolean | null>): this {
    const id = this.id
    const fullname = namespace(name)
    return this.each(function (d, i, group) {
      const target = isFunction(value) ? value.call(this, d, i, group) : value
      editableSchedule(this, id).tweens.set(`attr.${name}`, function () {
        const element = this as Element
        if (target == null) {
          if (isString(fullname)) element.removeAttribute(fullname)
          else element.removeAttributeNS(fullname.space, fullname.local)
          return
        }
        const previous = isString(fullname) ? element.getAttribute(fullname) : element.getAttributeNS(fullname.space, fullname.local)
        if (previous === `${target}`) return
        const interpolate = name === 'transform' ? interpolateTransformSvg(previous, `${target}`) : interpolateValue(previous, target)
        return function (progress) {
          const current = `${interpolate(progress)}`
          if (isString(fullname)) element.setAttribute(fullname, current)
          else element.setAttributeNS(fullname.space, fullname.local, current)
        }
      })
    })
  }

  attrTween (name: string, factory: ValueFn<GElement, Datum, ((this: GElement, progress: number) => string) | null>): this {
    const fullname = namespace(name)
    if (factory == null) return this.tween(`attr.${name}`, null)
    return this.tween(`attr.${name}`, function (d, i, group) {
      const interpolate = factory.call(this, d, i, group)
      if (!interpolate) return
      return function (progress) {
        const value = interpolate.call(this, progress)
        if (isString(fullname)) this.setAttribute(fullname, value)
        else this.setAttributeNS(fullname.space, fullname.local, value)
      }
    })
  }

  style (name: string, value: TransitionValue<GElement, Datum, string | number | boolean | null>, priority = ''): this {
    const id = this.id
    return this.each(function (d, i, group) {
      const schedule = editableSchedule(this, id)
      const target = isFunction(value) ? value.call(this, d, i, group) : value
      const listeners = schedule.listeners.get('end') ?? new Map<string, TransitionListener>()
      schedule.listeners.set('end', listeners)
      listeners.delete(`style.${name}`)
      if (target == null) listeners.set(`style.${name}`, function () { this.style.removeProperty(name) })
      schedule.tweens.set(`style.${name}`, function () {
        const previous = getStyle(this, name)
        let next = target
        if (next == null) {
          this.style.removeProperty(name)
          next = getStyle(this, name)
        }
        if (previous === `${next}`) return
        const interpolate = name === 'transform' ? interpolateTransformCss(previous, `${next}`) : interpolateValue(previous, next)
        return function (progress) { this.style.setProperty(name, `${interpolate(progress)}`, target == null ? '' : priority) }
      })
    })
  }

  text (value: TransitionValue<GElement, Datum, string | number | boolean | null>): this {
    const id = this.id
    return this.each(function (d, i, group) {
      const target = isFunction(value) ? value.call(this, d, i, group) : value
      editableSchedule(this, id).tweens.set('text', function () { this.textContent = target == null ? '' : `${target}` })
    })
  }

  remove (): this {
    const id = this.id
    return this.on('end.remove', function () { removeTransitionNode(getTransitionSchedule(this, id)) })
  }
}

export const transition = Transition.create
