import React, { useEffect, useRef, useState } from 'react'
import { ComponentCore } from '@unovis/ts/core/component'
import { smartD3Transition as smartTransition } from '@unovis/ts/utils/d3-transition'
import { interrupt, transition } from '@unovis/ts/utils/transition'

import { ExampleViewerDurationProps } from '@src/components/ExampleViewer'

import {
  ARC_RADIUS,
  BAR_BASELINE,
  BAR_SPACING,
  BAR_WIDTH,
  DATASETS,
  DEFAULT_DURATION,
  PANEL_HEIGHT,
  PANEL_WIDTH,
  RAPID_UPDATE_INTERVAL,
} from './constants'
import s from './style.module.css'

export const title = 'Transition Engine Prototype'
export const subTitle = 'Unovis engine and D3 reference, side by side'

type Engine = (selection: any, duration: number) => any
type AnimatedPath = SVGPathElement & { angle?: number }

function arcPath (angle: number): string {
  const x = Math.sin(angle) * ARC_RADIUS
  const y = -Math.cos(angle) * ARC_RADIUS
  return `M0,0L0,${-ARC_RADIUS}A${ARC_RADIUS},${ARC_RADIUS} 0 ${angle > Math.PI ? 1 : 0},1 ${x},${y}Z`
}

function customTransition (selection: any, duration: number): any {
  selection.nodes().forEach((node: Element) => interrupt(node))
  return duration ? transition(selection).duration(duration) : selection
}

export function ComparisonPanel ({ engine, index, duration, label }: {
  engine: Engine;
  index: number;
  duration: number;
  label: string;
}): React.ReactNode {
  const svgRef = useRef<SVGSVGElement>(null)
  const rootRef = useRef<ComponentCore<number[]> | undefined>(undefined)

  useEffect(() => {
    const root = new ComponentCore<number[]>()
    rootRef.current = root
    svgRef.current?.append(root.element)
    root.g.append('line').attr('x1', 20).attr('x2', 470).attr('y1', BAR_BASELINE).attr('y2', BAR_BASELINE).attr('stroke', 'currentColor').attr('opacity', 0.2)
    root.g.append('path').attr('class', 'comparison-line').attr('fill', 'none').attr('stroke', '#38a889').attr('stroke-width', 3)
    root.g.append('circle').attr('cx', 430).attr('cy', 250).attr('r', ARC_RADIUS).attr('fill', 'currentColor').attr('opacity', 0.08)
    root.g.append('path').attr('class', 'comparison-arc').attr('transform', 'translate(430,250)').attr('fill', '#e6a340')
    return () => {
      engine(root.g.selectAll('*'), 0)
      root.element.remove()
    }
  }, [engine])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const values = DATASETS[index % DATASETS.length]
    const bars = root.g.selectAll<SVGRectElement, number>('.comparison-bar').data(values)
    const entered = bars.enter().append('rect').attr('class', 'comparison-bar')
      .attr('x', (d, i) => 25 + i * BAR_SPACING).attr('y', BAR_BASELINE).attr('width', BAR_WIDTH).attr('height', 0).attr('rx', 4)
      .attr('fill', '#5087e0')
    engine(entered.merge(bars), duration)
      .attr('y', (d: number) => BAR_BASELINE - d * 1.5)
      .attr('height', (d: number) => d * 1.5)
      .attr('fill', (d: number) => d > 60 ? '#8a6cda' : '#5087e0')
      .style('opacity', 1)
    engine(bars.exit(), duration).attr('y', BAR_BASELINE).attr('height', 0).style('opacity', 0).remove()
      .on('interrupt', function () { this.remove() })

    const line = root.g.select('.comparison-line')
    const path = values.length ? values.map((value, i) => `${i ? 'L' : 'M'}${25 + i * BAR_SPACING},${300 - value}`).join('') : 'M25,300L25,300'
    engine(line, duration).attr('d', path).style('opacity', values.length ? 1 : 0)

    const arc = root.g.select<SVGPathElement>('.comparison-arc')
    const angle = (values.length ? values.reduce((sum, value) => sum + value, 0) / (values.length * 100) : 0.001) * Math.PI * 2
    if (duration) {
      engine(arc, duration).attrTween('d', function (this: AnimatedPath) {
        const from = this.angle ?? 0.001
        return (t: number): string => {
          this.angle = from + (angle - from) * t
          return arcPath(this.angle)
        }
      })
    } else {
      engine(arc, 0)
      ;(arc.node() as AnimatedPath).angle = angle
      arc.attr('d', arcPath(angle))
    }
  }, [engine, index, duration])

  return (
    <section className={s.panel}>
      <h3>{label}</h3>
      <svg ref={svgRef} viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`} role='img' aria-label={`${label} transition comparison`}/>
    </section>
  )
}

export const component = (props: ExampleViewerDurationProps): React.ReactNode => {
  const [index, setIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [instant, setInstant] = useState(false)
  const duration = instant ? 0 : (props.duration ?? DEFAULT_DURATION)

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => setIndex(index => index + 1), RAPID_UPDATE_INTERVAL)
    return () => clearInterval(interval)
  }, [running])

  return (
    <div className={s.comparison}>
      <h2>Transition engine prototype</h2>
      <p>Both panels run the same SVG updates. Compare enter/exit, colors, line paths and custom arc tweens; use rapid updates to interrupt animations.</p>
      <div className={s.controls}>
        <button onClick={() => setIndex(index => index + 1)}>Next dataset</button>
        <button onClick={() => setRunning(running => !running)}>{running ? 'Stop rapid updates' : 'Rapid updates'}</button>
        <label><input type='checkbox' checked={instant} onChange={event => setInstant(event.target.checked)}/> Duration 0</label>
        <span>{duration} ms · dataset {index % DATASETS.length + 1}/{DATASETS.length}</span>
      </div>
      <div className={s.panels}>
        <ComparisonPanel label='Unovis prototype' engine={customTransition} index={index} duration={duration}/>
        <ComparisonPanel label='D3 reference' engine={smartTransition} index={index} duration={duration}/>
      </div>
      <p className={s.note}>This view isolates the animation engine. Use the sidebar to try Unovis charts with the prototype integrated.</p>
    </div>
  )
}
