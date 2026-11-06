/* eslint-disable @typescript-eslint/no-unused-vars */
// d3 removes the attribute or style when the value is null or undefined and treats a falsy `classed` value as off,
// but its typings only accept `null`. Internal widening, not emitted to `dist`.
import { BaseType, ValueFn } from 'd3-selection'

type Value = string | number | boolean | null | undefined
type AttrValue = Value | ReadonlyArray<string | number>

declare module 'd3-selection' {
  interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    attr(name: string, value: AttrValue | ValueFn<GElement, Datum, AttrValue>): this;
    style(name: string, value: Value | ValueFn<GElement, Datum, Value>, priority?: null | 'important'): this;
    classed(names: string, value: boolean | null | undefined | ValueFn<GElement, Datum, boolean | null | undefined>): this;
  }
}

declare module 'd3-transition' {
  interface Transition<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    attr(name: string, value: Value | ValueFn<GElement, Datum, Value>): this;
    style(name: string, value: Value | ValueFn<GElement, Datum, Value>, priority?: null | 'important'): this;
  }
}

declare module './src/utils/d3' {
  interface VisAttrStylePatch<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    attr(name: string, value: Value | ValueFn<GElement, Datum, Value>): this;
    style(name: string, value: Value | ValueFn<GElement, Datum, Value>, priority?: null | 'important'): this;
  }
}
