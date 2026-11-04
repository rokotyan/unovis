import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { axisBottom } from 'd3-axis'
import { scaleLinear } from 'd3-scale'
import { select } from 'd3-selection'
import { interrupt as d3Interrupt } from 'd3-transition'
import type { Selection } from 'd3-selection'

import { interrupt, transition } from './index'

vi.hoisted(() => vi.useFakeTimers())

type Engine = (selection: Selection<any, any, any, any>, name?: string) => any

const engines: Engine[] = [(selection, name) => selection.transition(name), transition]

function pair (tag = 'g'): Selection<any, any, any, any>[] {
  const svg = select(document.body).append('svg')
  return engines.map(() => svg.append(tag).datum({ value: 10 }))
}

function expectEqual (selections: Selection<any, any, any, any>[]): void {
  expect(selections[1].node().outerHTML).toBe(selections[0].node().outerHTML)
}

function advance (milliseconds: number): void {
  vi.advanceTimersByTime(milliseconds)
}

afterEach(() => {
  advance(1000)
  document.body.innerHTML = ''
})

afterAll(() => vi.useRealTimers())

describe('Unovis transitions against D3', () => {
  it('matches numeric, color, string and namespaced attributes throughout a transition', () => {
    const selections = pair('path')
    selections.forEach((selection, i) => {
      selection.attr('x', 0).attr('fill', 'red').attr('d', 'M0,0L10,20')
      engines[i](selection).duration(160)
        .attr('x', d => d.value)
        .attr('fill', '#0000ff')
        .attr('d', 'M10,20L30,40')
        .attr('xlink:href', '#next')
    })
    expectEqual(selections)
    for (let i = 0; i < 12; i++) {
      advance(16)
      expectEqual(selections)
    }
  })

  it('matches style interpolation, priority and removal to computed styles', () => {
    const stylesheet = document.createElement('style')
    stylesheet.textContent = '.test-transition { opacity: 0.25; fill: blue; }'
    document.head.append(stylesheet)
    const selections = pair('path')
    selections.forEach((selection, i) => {
      selection.attr('class', 'test-transition').style('opacity', 1).style('fill', 'red')
      engines[i](selection).duration(160)
        .style('opacity', null)
        .style('fill', null)
        .style('stroke-width', 4, 'important')
    })
    for (let i = 0; i < 12; i++) {
      advance(16)
      expectEqual(selections)
    }
    expect(selections[1].node().style.opacity).toBe('')
    stylesheet.remove()
  })

  it('evaluates target accessors immediately and tween factories after start listeners', () => {
    const selections = pair('path')
    const events: string[][] = [[], []]
    selections.forEach((selection, i) => {
      engines[i](selection).duration(80)
        .attr('x', function (d, index, group) {
          expect(this).toBe(group[index])
          events[i].push('accessor')
          return d.value
        })
        .on('start.test', function () {
          events[i].push('start')
          this.setAttribute('y', '2')
        })
        .attrTween('y', function (d, index, group) {
          expect(this).toBe(group[index])
          events[i].push('factory')
          const from = +this.getAttribute('y')
          return t => `${from + t * d.value}`
        })
        .on('end.test', () => events[i].push('end'))
    })
    expect(events[1]).toEqual(['accessor'])
    for (let i = 0; i < 7; i++) {
      advance(16)
      expectEqual(selections)
      expect(events[1]).toEqual(events[0])
    }
    expect(events[1]).toEqual(['accessor', 'start', 'factory', 'end'])
  })

  it('cancels pending transitions and interrupts running transitions with the same name', () => {
    const selections = pair()
    const events: string[][] = [[], []]
    selections.forEach((selection, i) => {
      engines[i](selection).duration(160).attr('x', 100)
        .on('cancel', () => events[i].push('cancel'))
      engines[i](selection).duration(160).attr('x', 200)
        .on('start', () => events[i].push('start'))
        .on('interrupt', () => events[i].push('interrupt'))
    })
    advance(64)
    expectEqual(selections)
    expect(events[1]).toEqual(events[0])
    selections.forEach((selection, i) => engines[i](selection).duration(80).attr('x', 300))
    advance(16)
    expectEqual(selections)
    expect(events[1]).toEqual(events[0])
    advance(96)
    expectEqual(selections)
    expect(events[1]).toEqual(['start', 'interrupt'])
  })

  it('preserves independent names and only removes after the other transitions finish', () => {
    const selections = pair()
    selections.forEach((selection, i) => {
      engines[i](selection, 'position').duration(160).attr('x', 10)
      engines[i](selection).duration(32).attr('y', 20).remove()
    })
    advance(64)
    expectEqual(selections)
    expect(selections[1].node().isConnected).toBe(true)
    advance(160)
    expectEqual(selections)
    expect(selections[1].node().isConnected).toBe(true)
  })

  it('matches explicit interruption before start and during an active transition', () => {
    const selections = pair()
    const events: string[][] = [[], []]
    const interruptors = [d3Interrupt, interrupt]
    selections.forEach((selection, i) => {
      engines[i](selection).duration(160)
        .on('cancel', () => events[i].push('cancel'))
        .on('interrupt', () => events[i].push('interrupt'))
      interruptors[i](selection.node())
      engines[i](selection).duration(160).attr('x', 100)
        .on('interrupt', () => events[i].push('interrupt'))
    })
    advance(64)
    selections.forEach((selection, i) => interruptors[i](selection.node()))
    expect(events[1]).toEqual(events[0])
    expect(events[1]).toEqual(['cancel', 'interrupt'])
    expectEqual(selections)
    advance(200)
    expectEqual(selections)
  })

  it('defers zero-duration transitions and applies final values before end callbacks', () => {
    const selections = pair()
    const events: string[][] = [[], []]
    selections.forEach((selection, i) => {
      selection.attr('x', 0)
      engines[i](selection).duration(0).attr('x', 10).text('done')
        .on('end', function () { events[i].push(`${this.getAttribute('x')}:${this.textContent}`) })
    })
    expect(events[1]).toEqual([])
    expect(selections[1].attr('x')).toBe('0')
    advance(32)
    expectEqual(selections)
    expect(events[1]).toEqual(events[0])
    expect(events[1]).toEqual(['10:done'])
  })

  it('replaces and removes namespaced listeners without changing their order', () => {
    const selections = pair()
    const events: string[][] = [[], []]
    selections.forEach((selection, i) => {
      engines[i](selection).duration(32)
        .on('end.first', () => events[i].push('old'))
        .on('end.second', () => events[i].push('second'))
        .on('end.first', () => events[i].push('first'))
        .on('start.removed end.removed', () => events[i].push('removed'))
        .on('.removed', null)
    })
    advance(64)
    expect(events[1]).toEqual(events[0])
    expect(events[1]).toEqual(['second', 'first'])
  })

  it('inherits timing for descendant selections', () => {
    const selections = pair()
    selections.forEach((selection, i) => {
      selection.append('path').attr('x', 0)
      engines[i](selection).duration(160).ease(t => t)
        .select('path').attr('x', 100)
    })
    for (let i = 0; i < 12; i++) {
      advance(16)
      expectEqual(selections)
    }
  })

  it('preserves completion order when a style removal is configured again', () => {
    const selections = pair()
    const events: string[][] = [[], []]
    selections.forEach((selection, i) => {
      selection.style('opacity', 1)
      engines[i](selection).duration(32)
        .style('opacity', null)
        .on('end.user', function () { events[i].push(this.style.opacity) })
        .style('opacity', null)
    })
    advance(64)
    expect(events[1]).toEqual(events[0])
    expectEqual(selections)
  })

  it('calls custom easing functions without binding transition state', () => {
    const selections = pair()
    selections.forEach((selection, i) => {
      selection.attr('x', 0)
      engines[i](selection).duration(80)
        .ease(function (this: unknown, progress: number): number {
          expect(this).toBeNull()
          return progress
        })
        .attr('x', 100)
    })
    advance(32)
    expectEqual(selections)
  })

  it('runs D3 Axis without changing the global D3 selection prototype', () => {
    // JSDOM has no SVG transform lists; axis ticks only need translations here.
    const transform = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'transform')
    Object.defineProperty(SVGElement.prototype, 'transform', {
      configurable: true,
      get () {
        return {
          baseVal: {
            consolidate: () => {
              const [e = 0, f = 0] = (this.getAttribute('transform')?.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
              return { matrix: { a: 1, b: 0, c: 0, d: 1, e, f } }
            },
          },
        }
      },
    })
    try {
      const selections = pair()
      const axis = axisBottom(scaleLinear().domain([0, 10]).range([0, 100])).ticks(2)
      selections.forEach(selection => selection.call(axis))
      axis.scale(scaleLinear().domain([0, 20]).range([0, 100]))
      const original = selections[0].transition
      selections.forEach((selection, i) => engines[i](selection).duration(160).call(axis))
      expect(selections[1].transition).toBe(original)
      for (let i = 0; i < 12; i++) {
        advance(16)
        expectEqual(selections)
      }
    } finally {
      if (transform) Object.defineProperty(SVGElement.prototype, 'transform', transform)
      else delete (SVGElement.prototype as any).transform
    }
  })
})
