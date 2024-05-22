import { select, Selection } from 'd3-selection'
import { interrupt } from 'd3-transition'
import { Axis as D3Axis, axisBottom, axisLeft, axisRight, axisTop } from 'd3-axis'

// Core
import { XYComponentCore } from 'core/xy-component'

// Types
import { Position } from 'types/position'
import { ContinuousScale } from 'types/scale'
import { Spacing } from 'types/spacing'
import { FitMode, TextAlign, TrimMode, UnovisText, UnovisTextOptions, VerticalAlign } from 'types/text'

// Utils
import { smartTransition } from 'utils/d3'
import { renderTextToSvgTextElement, trimSVGText } from 'utils/text'
import { isEqual } from 'utils/data'

// Local Types
import { AxisType } from './types'

// Config
import { AxisDefaultConfig, AxisConfigInterface } from './config'

// Styles
import * as s from './style'
import { tick } from '../../../lib/components/axis/style'

export class Axis<Datum> extends XYComponentCore<Datum, AxisConfigInterface<Datum>> {
  static selectors = s
  protected _defaultConfig: AxisConfigInterface<Datum> = AxisDefaultConfig
  public config: AxisConfigInterface<Datum> = this._defaultConfig
  axisGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>
  gridGroup: Selection<SVGGElement, unknown, SVGGElement, unknown>

  private _axisRawBBox: DOMRect
  private _axisSizeBBox: SVGRect
  private _requiredMargin: Spacing
  private _defaultNumTicks = 3
  private _minMaxTicksOnlyEnforceWidth = 250

  events = {}

  constructor (config?: AxisConfigInterface<Datum>) {
    super()
    if (config) this.setConfig(config)
    this.axisGroup = this.g.append('g')
    this.gridGroup = this.g.append('g')
      .attr('class', s.grid)
  }

  /** Renders axis to an invisible grouped to calculate automatic chart margins */
  preRender (): void {
    const { config } = this
    const axisRenderHelperGroup = this.g.append('g').attr('opacity', 0)

    this._renderAxis(axisRenderHelperGroup, 0)

    // Store axis raw BBox (without the label) for further label positioning (see _renderAxisLabel)
    this._axisRawBBox = axisRenderHelperGroup.node().getBBox()

    // Align tick text
    if (config.tickTextAlign) this._alignTickLabels()

    // Render label and store total axis size and required margins
    this._renderAxisLabel(axisRenderHelperGroup)
    this._axisSizeBBox = this._getAxisSize(axisRenderHelperGroup)
    this._requiredMargin = this._getRequiredMargin(this._axisSizeBBox)

    axisRenderHelperGroup.remove()
  }

  getPosition (): Position {
    const { config: { type, position } } = this
    return (position ?? ((type === AxisType.X) ? Position.Bottom : Position.Left)) as Position
  }

  _getAxisSize (selection: Selection<SVGGElement, unknown, SVGGElement, undefined>): SVGRect {
    const bBox = selection.node().getBBox()
    return bBox
  }

  _getRequiredMargin (axisSize = this._axisSizeBBox): Spacing {
    const { config: { type, position } } = this

    switch (type) {
      case AxisType.X: {
        const tolerancePx = 1
        const xEnd = this._axisSizeBBox.x + this._axisSizeBBox.width

        const left = this._axisSizeBBox.x < 0 ? Math.abs(this._axisSizeBBox.x) : 0
        const right = (xEnd - this._width) > tolerancePx ? xEnd - this._width : 0

        switch (position) {
          case Position.Top: return { top: axisSize.height, left, right }
          case Position.Bottom: default: return { bottom: axisSize.height, left, right }
        }
      }
      case AxisType.Y: {
        const bleedY = axisSize.height > this._height ? (axisSize.height - this._height) / 2 : 0
        const top = bleedY
        const bottom = bleedY

        switch (position) {
          case Position.Right: return { right: axisSize.width, top, bottom }
          case Position.Left: default: return { left: axisSize.width, top, bottom }
        }
      }
    }
  }

  getRequiredMargin (): Spacing {
    return this._requiredMargin
  }

  /** Calculates axis transform:translate offset based on passed container margins */
  getOffset (containerMargin: Spacing): {left: number; top: number} {
    const { config: { type, position } } = this

    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return { top: containerMargin.top, left: containerMargin.left }
          case Position.Bottom: default: return { top: containerMargin.top + this._height, left: containerMargin.left }
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return { top: containerMargin.top, left: containerMargin.left + this._width }
          case Position.Left: default: return { top: containerMargin.top, left: containerMargin.left }
        }
    }
  }

  _render (duration = this.config.duration, selection = this.axisGroup): void {
    const { config } = this

    this._renderAxis(selection, duration)
    this._renderAxisLabel(selection)

    if (config.gridLine) {
      const gridGen = this._buildGrid().tickFormat(() => '')
      gridGen.tickValues(this._getConfiguredTickValues())
      // Interrupting all active transitions first to prevent them from being stuck.
      // Somehow we see it happening in Angular apps.
      this.gridGroup.selectAll('*').interrupt()
      smartTransition(this.gridGroup, duration).call(gridGen).style('opacity', 1)
    } else {
      smartTransition(this.gridGroup, duration).style('opacity', 0)
    }

    if (config.tickTextAlign) this._alignTickLabels()
  }

  _buildAxis (): D3Axis<any> {
    const { config: { type, position, tickPadding } } = this

    const ticks = this._getNumTicks()
    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return axisTop(this.xScale).ticks(ticks).tickPadding(tickPadding)
          case Position.Bottom: default: return axisBottom(this.xScale).ticks(ticks).tickPadding(tickPadding)
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return axisRight(this.yScale).ticks(ticks).tickPadding(tickPadding)
          case Position.Left: default: return axisLeft(this.yScale).ticks(ticks).tickPadding(tickPadding)
        }
    }
  }

  _buildGrid (): D3Axis<any> {
    const { config: { type, position } } = this

    const ticks = this._getNumTicks()
    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return axisTop(this.xScale).ticks(ticks * 2).tickSize(-this._height).tickSizeOuter(0)
          case Position.Bottom: default: return axisBottom(this.xScale).ticks(ticks * 2).tickSize(-this._height).tickSizeOuter(0)
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return axisRight(this.yScale).ticks(ticks * 2).tickSize(-this._width).tickSizeOuter(0)
          case Position.Left: default: return axisLeft(this.yScale).ticks(ticks * 2).tickSize(-this._width).tickSizeOuter(0)
        }
    }
  }

  _renderAxis (selection = this.axisGroup, duration = this.config.duration): void {
    const { config } = this

    const axisGen = this._buildAxis()
    const tickValues: (number[] | Date[]) = this._getConfiguredTickValues() || axisGen.scale<ContinuousScale>().ticks(this._getNumTicks())
    axisGen.tickValues(tickValues)

    // Interrupting all active transitions first to prevent them from being stuck.
    // Somehow we see it happening in Angular apps.
    selection.selectAll('*').interrupt()
    smartTransition(selection, duration).call(axisGen)

    const ticks = selection.selectAll<SVGGElement, number | Date>('g.tick')

    ticks
      .classed(s.tick, true)
      .style('font-size', config.tickTextFontSize)

    // Selecting the <text> elements of the ticks to apply formatting. By default, this selection
    // will include exiting elements, so we're filtering them out.
    const tickText = selection.selectAll<SVGTextElement, number | Date>('g.tick > text')
      .filter(tickValue => tickValues.some((t: number | Date) => isEqual(tickValue, t))) // We use isEqual to compare Dates
      .classed(s.tickLabel, true)
      .style('fill', config.tickTextColor) as Selection<SVGTextElement, number, SVGGElement, unknown> | Selection<SVGTextElement, Date, SVGGElement, unknown>


    // We interrupt the transition on tick's <text> to make it 'wrappable'
    tickText.nodes().forEach(node => interrupt(node))

    tickText.each((value: number | Date, i: number, elements: ArrayLike<SVGTextElement>) => {
      const text = config.tickFormat?.(value, i, tickValues) ?? `${value}`
      const textElement = elements[i] as SVGTextElement
      const textMaxWidth = config.tickTextWidth || (config.type === AxisType.X ? this._containerWidth / (ticks.size() + 1) : this._containerWidth / 5)
      const styleDeclaration = getComputedStyle(textElement)
      const fontSize = Number.parseFloat(styleDeclaration.fontSize)
      const fontFamily = styleDeclaration.fontFamily
      const textOptions: UnovisTextOptions = {
        verticalAlign: config.type === AxisType.X ? VerticalAlign.Top : VerticalAlign.Middle,
        width: textMaxWidth,
        textRotationAngle: config.tickTextAngle,
        separator: config.tickTextSeparator,
        wordBreak: config.tickTextForceWordBreak,
      }

      if (config.tickTextFitMode === FitMode.Trim) {
        const textElementSelection = select<SVGTextElement, string>(textElement).text(text)
        trimSVGText(textElementSelection, textMaxWidth, config.tickTextTrimType as TrimMode, true, fontSize, 0.58)

        const trimedText = select<SVGTextElement, string>(textElement).text() ?? ''
        const textBlock: UnovisText = { trimedText, fontFamily, fontSize }
        renderTextToSvgTextElement(textElement, textBlock, textOptions, true)
      } else {
        const textBlock: UnovisText = { text, fontFamily, fontSize }
        renderTextToSvgTextElement(textElement, textBlock, textOptions)
      }
    })

    selection
      .classed(s.axis, true)
      .classed(s.hideTickLine, !config.tickLine)
      .classed(s.hideDomain, !config.domainLine)

    if (config.fullSize) {
      const path = this._getFullDomainPath(0)
      smartTransition(selection.select('.domain'), duration).attr('d', path)
    }
  }

  _getNumTicks (): number {
    const { config: { type, numTicks } } = this

    if (numTicks) return numTicks

    if (type === AxisType.X) {
      const xRange = this.xScale.range() as [number, number]
      const width = xRange[1] - xRange[0]
      return Math.floor(width / 175)
    }

    if (type === AxisType.Y) {
      const yRange = this.yScale.range() as [number, number]
      const height = Math.abs(yRange[0] - yRange[1])
      return Math.pow(height, 0.85) / 25
    }

    return this._defaultNumTicks
  }

  _getConfiguredTickValues (): number[] | null {
    const { config: { tickValues, type, minMaxTicksOnly } } = this
    const scale = type === AxisType.X ? this.xScale : this.yScale
    const scaleDomain = scale?.domain() as [number, number]

    if (tickValues) {
      return tickValues.filter(v => (v >= scaleDomain[0]) && (v <= scaleDomain[1]))
    }

    if (minMaxTicksOnly || (type === AxisType.X && this._width < this._minMaxTicksOnlyEnforceWidth)) {
      return scaleDomain as number[]
    }

    return null
  }

  _getFullDomainPath (tickSize = 0): string {
    const { config: { type } } = this
    switch (type) {
      case AxisType.X: return `M0.5, ${tickSize} V0.5 H${this._width + 0.5} V${tickSize}`
      case AxisType.Y: return `M${-tickSize}, ${this._height + 0.5} H0.5 V0.5 H${-tickSize}`
    }
  }

  _renderAxisLabel (selection = this.axisGroup): void {
    const { type, label, labelMargin, labelFontSize } = this.config

    // Remove the old label first to calculate the axis size properly
    selection.selectAll(`.${s.label}`).remove()

    // Calculate label position and rotation
    const axisPosition = this.getPosition()
    // We always use this.axisRenderHelperGroup to calculate the size of the axis because
    //    this.axisGroup will give us incorrect values due to animation
    const { width: axisWidth, height: axisHeight } = this._axisRawBBox ?? selection.node().getBBox()

    const offsetX = type === AxisType.X ? this._width / 2 : (-1) ** (+(axisPosition === Position.Left)) * axisWidth
    const offsetY = type === AxisType.X ? (-1) ** (+(axisPosition === Position.Top)) * axisHeight : this._height / 2

    const marginX = type === AxisType.X ? 0 : (-1) ** (+(axisPosition === Position.Left)) * labelMargin
    const marginY = type === AxisType.X ? (-1) ** (+(axisPosition === Position.Top)) * labelMargin : 0

    // Append new label
    selection
      .append('text')
      .attr('class', s.label)
      .text(label)
      .attr('dy', `${this._getLabelDY()}em`)
      .attr('transform', `translate(${offsetX + marginX},${offsetY + marginY})`)
      .style('font-size', labelFontSize)
      .style('fill', this.config.labelColor)
  }

  _getLabelDY (): number {
    const { type, position } = this.config
    switch (type) {
      case AxisType.X:
        switch (position) {
          case Position.Top: return 0
          case Position.Bottom: default: return 0.75
        }
      case AxisType.Y:
        switch (position) {
          case Position.Right: return 0.75
          case Position.Left: default: return -0.25
        }
    }
  }
  // const textElementX = options.x ?? +textElement.getAttribute('x')
  // const textElementY = options.y ?? +textElement.getAttribute('y')
  // const x = textElementX ?? 0
  // let y = textElementY ?? 0

  // if (options.textAlign) {
  //   textElement.setAttribute('text-anchor', getTextAnchorFromTextAlign(options.textAlign))
  // }

  // if (options.verticalAlign && options.verticalAlign !== VerticalAlign.Top) {
  //   const height = estimateWrappedTextHeight(wrappedText)
  //   const dy = options.verticalAlign === VerticalAlign.Middle ? -height / 2
  //     : options.verticalAlign === VerticalAlign.Bottom ? -height : 0

  //   y += dy
  // }
  // if (options.textRotationAngle) {
  //   textElement.setAttribute('transform', `rotate(${(options.textRotationAngle === 0 || options.textRotationAngle) ? options.textRotationAngle : 0} ${x} ${y})`)
  // } else {
  //   textElement.removeAttribute('transform')
  // }

  _alignTickLabels (): void {
    const { config: { type, tickTextAlign, tickTextAngle, position } } = this
    const tickText = this.g.selectAll('g.tick > text')
    const textAnchor = this._getTickTextAnchor(tickTextAlign as TextAlign)
    const translateX = type === AxisType.X
      ? 0
      : this._getYTickTextTranslate(tickTextAlign as TextAlign, position as Position)

    tickText.each((value: number | Date, i: number, elements: ArrayLike<SVGTextElement>) => {
      const textElement = elements[i] as SVGTextElement
      const rotate = textElement.getAttribute('transform')
      textElement
        // .setAttribute('text-anchor', textAnchor)
        .setAttribute('transform', `translate(${translateX},0) ${rotate}`)
      // console.log(textElement.getAttribute("transform"), translateX)
    })

    // console.log(tickText[0].getAttribute('x'))
    tickText
      .attr('text-anchor', textAnchor)
  }

  _getTickTextAnchor (textAlign: TextAlign): string {
    switch (textAlign) {
      case TextAlign.Left: return 'start'
      case TextAlign.Right: return 'end'
      case TextAlign.Center: return 'middle'
      default: return null
    }
  }

  _getYTickTextTranslate (textAlign: TextAlign, axisPosition: Position = Position.Left): number {
    const defaultTickTextSpacingPx = 9 // Default in D3
    const width = this._axisRawBBox.width - defaultTickTextSpacingPx

    switch (textAlign) {
      case TextAlign.Left: return axisPosition === Position.Left ? width * -1 : 0
      case TextAlign.Right: return axisPosition === Position.Left ? 0 : width
      case TextAlign.Center: return axisPosition === Position.Left ? width * (-0.5) : width * 0.5
      default: return 0
    }
  }
}
