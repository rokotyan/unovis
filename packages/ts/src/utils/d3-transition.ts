import { interrupt } from 'd3-transition'
import type { Transition } from 'd3-transition'
import type { BaseType, Selection } from 'd3-selection'

import type { VisAttrStylePatch } from './d3'

// Brush and Zoom own D3 transition state, including interruption during gestures.
export function createD3Transition<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
  selection: Selection<GElement, Datum, PElement, PDatum>
): Transition<GElement, Datum, PElement, PDatum> {
  return selection.transition()
}

export function smartD3Transition<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
  selection: Selection<GElement, Datum, PElement, PDatum>,
  duration?: number,
  easing?: (normalizedTime: number) => number
): (Selection<GElement, Datum, PElement, PDatum> | Transition<GElement, Datum, PElement, PDatum>) & VisAttrStylePatch<GElement, Datum, PElement, PDatum> {
  selection.nodes().forEach(node => interrupt(node))
  if (!duration) return selection
  const transition = createD3Transition(selection).duration(duration)
  if (easing) transition.ease(easing)
  return transition
}
