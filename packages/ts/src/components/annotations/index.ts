import { select, Selection } from 'd3-selection'

// Core
import { ComponentCore } from 'core/component'

// Utils
import { isNumber } from 'utils/data'
import { smartTransition } from 'utils/d3'
import { renderTextIntoFrame } from 'utils/text'
import { parseUnit } from 'utils/misc'
import { UNOVIS_TEXT_DEFAULT } from 'styles'

// Local Types
import { AnnotationItem, AnnotationSubject } from './types'

// Config
import { AnnotationsDefaultConfig, AnnotationsConfigInterface } from './config'

// Styles
import * as s from './style'

export class Annotations extends ComponentCore<unknown[], AnnotationsConfigInterface> {
  static selectors = s
  static cssVariables = s.variables
  protected _defaultConfig = AnnotationsDefaultConfig as AnnotationsConfigInterface
  public config: AnnotationsConfigInterface = this._defaultConfig

  g: Selection<SVGGElement, unknown, null, undefined>

  events = {}

  constructor (config?: AnnotationsConfigInterface) {
    super()
    if (config) this.setConfig(config)
  }

  _render (customDuration?: number): void {
    super._render(customDuration)
    const { config } = this

    const duration = isNumber(customDuration) ? customDuration : config.duration

    const annotations = this.g.selectAll<SVGGElement, AnnotationItem[]>(`.${s.annotation}`)
      .data(config.items ?? [], d => JSON.stringify(d))

    const annotationsEnter = annotations.enter().append('g')
      .attr('class', s.annotation)
      .style('opacity', 0)

    // Content
    annotationsEnter.append('g').attr('class', s.annotationContent)

    // Subject
    const subject = annotationsEnter.append('g')
      .attr('class', s.annotationSubject)

    subject.append('circle')
    subject.append('line')

    const annotationsMerged = annotationsEnter.merge(annotations)
      .attr('cursor', d => d.cursor ?? null)
      .each((annotation, i, elements) => {
        if (annotation.content) {
          const content = typeof annotation.content === 'string' ? { ...UNOVIS_TEXT_DEFAULT, text: annotation.content } : annotation.content
          const x = parseUnit(annotation.x ?? 0, this._width)
          const y = parseUnit(annotation.y ?? 0, this._height)
          const width = parseUnit(annotation.width ?? 0, this._width)
          const height = parseUnit(annotation.height ?? 0, this._height)
          const options = { ...annotation, x, y, width, height }

          const contentGroupElement = select(elements[i]).select<SVGGElement>(`.${s.annotationContent}`)
          const node = contentGroupElement.node()
          if (node) {
            renderTextIntoFrame(node, content, options)
          }
        }

        if (annotation.subject) {
          requestAnimationFrame(() => this._renderSubject(elements[i], annotation.subject))
        }
      })

    smartTransition(annotationsMerged, duration)
      .style('opacity', 1)

    smartTransition(annotations.exit(), duration)
      .style('opacity', 0)
      .remove()
  }


  private _renderSubject (
    annotationGroupElement: SVGElement,
    subject: AnnotationSubject | undefined
  ): void {
    const contentGroup = select(annotationGroupElement).select<SVGGElement>(`.${s.annotationContent}`)
    const subjectGroup = select(annotationGroupElement).select<SVGGElement>(`.${s.annotationSubject}`)

    if (!subject) {
      subjectGroup.select('circle').attr('visibility', 'hidden')
      subjectGroup.select('line').attr('visibility', 'hidden')
      return
    }

    const subjectX = parseUnit(
      typeof subject.x === 'function' ? subject.x() : subject.x,
      this._width
    )
    const subjectY = parseUnit(
      typeof subject.y === 'function' ? subject.y() : subject.y,
      this._height
    )

    const subjectStrokeColor = subject.strokeColor ?? null
    const subjectFillColor = subject.fillColor ?? null
    const subjectStrokeDasharray = subject.strokeDasharray ?? null
    const connectorLineColor = subject.connectorLineColor ?? null
    const connectorLineStrokeDasharray = subject.connectorLineStrokeDasharray ?? null
    const subjectRadius = subject.radius ?? 0
    const padding = subject.padding ?? 5

    const contentNode = contentGroup.node()
    if (!contentNode) return
    const contentBbox = contentNode.getBBox()
    const dy = Math.abs(subjectY - (contentBbox.y + contentBbox.height / 2))
    const dx = Math.abs(subjectX - (contentBbox.x + contentBbox.width / 2))
    const annotationPadding = 5
    const x2 = (dx < dy) && ((subjectY < contentBbox.y) || (subjectY > (contentBbox.y + contentBbox.height)))
      ? contentBbox.x + contentBbox.width / 2
      : (subjectX < contentBbox.x) ? contentBbox.x - annotationPadding : contentBbox.x + contentBbox.width + annotationPadding

    const y2 = (dx >= dy) || ((subjectY >= contentBbox.y) && (subjectY <= (contentBbox.y + contentBbox.height)))
      ? contentBbox.y + contentBbox.height / 2
      : (subjectY < contentBbox.y) ? contentBbox.y - annotationPadding : contentBbox.y + contentBbox.height + annotationPadding

    const angle = Math.atan2(y2 - subjectY, x2 - subjectX) * 180 / Math.PI
    const x1 = subjectX + Math.cos(angle * Math.PI / 180) * (subjectRadius + padding)
    const y1 = subjectY + Math.sin(angle * Math.PI / 180) * (subjectRadius + padding)

    const circle = subjectGroup.select('circle')
      .attr('visibility', null)
      .attr('cx', subjectX)
      .attr('cy', subjectY)
      .attr('r', subjectRadius)

    if (subjectStrokeColor === null) circle.style('stroke', null)
    else circle.style('stroke', subjectStrokeColor)

    if (subjectFillColor === null) circle.style('fill', null)
    else circle.style('fill', subjectFillColor)

    if (subjectStrokeDasharray === null) circle.style('stroke-dasharray', null)
    else circle.style('stroke-dasharray', subjectStrokeDasharray)

    const line = subjectGroup.select('line')
      .attr('visibility', null)
      .attr('x1', x1)
      .attr('y1', y1)
      .attr('x2', x2)
      .attr('y2', y2)

    if (connectorLineColor === null) line.style('stroke', null)
    else line.style('stroke', connectorLineColor)

    if (connectorLineStrokeDasharray === null) line.style('stroke-dasharray', null)
    else line.style('stroke-dasharray', connectorLineStrokeDasharray)
  }
}
