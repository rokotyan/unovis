export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Makes the `K` properties required and excludes `undefined` from them */
export type WithDefaults<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: Exclude<T[P], undefined> };

/** Keys of the `Defaults` object that exist in `T` and have a value other than `undefined`.
 * Written as a distributive conditional type so that it resolves to a plain union of keys in the emitted declarations */
export type DefaultedKeysOf<Defaults, T> = keyof Defaults extends infer K
  ? K extends keyof T & keyof Defaults ? (undefined extends Defaults[K] ? never : K) : never
  : never;

/** Marks the keys of `D` that don't exist in `T` as `never`. Plain-object values are checked one level deep, which
 * covers nested config settings (e.g. `margin`). Used to reject unknown keys in objects whose type is inferred,
 * because excess property checks don't apply to those */
export type NoExtraKeys<T, D> = { [K in keyof D]: K extends keyof T ? NoExtraNestedKeys<NonNullable<T[K]>, D[K]> : never };
type NoExtraNestedKeys<T, D> = D extends object
  ? T extends ((...args: never[]) => unknown) | readonly unknown[] ? D
    : T extends object ? { [K in keyof D]: K extends keyof T ? D[K] : never } : D
  : D;

/** Config `T` with the values of the `Defaults` object applied: the properties that have a default are required and can't be `undefined` */
export type ResolvedConfig<T, Defaults> = WithDefaults<T, DefaultedKeysOf<Defaults, T>>;

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type LengthUnit = number | `${number}%` | `${number}px`
