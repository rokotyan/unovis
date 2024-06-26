// Local Types
import { GenericAccessor } from 'types/accessor'
import { BulletLegendItemInterface, BulletShape, BulletLegendOrientation } from './types'

export interface BulletLegendConfigInterface {
  /** Legend items. Array of `BulletLegendItemInterface`:
   * ```
   * {
   *   name: string | number;
   *   color?: string;
   *   shape?: BulletShape;
   *   inactive?: boolean;
   *   hidden?: boolean;
   *   pointer?: boolean;
   * }
   * ```
  * Default: `[]` */
  items: BulletLegendItemInterface[];
  /** Apply a specific class to the labels. Default: `''` */
  labelClassName?: string;
  /** Callback function for the legend item click. Default: `undefined` */
  onLegendItemClick?: ((d: BulletLegendItemInterface, i: number) => void);
  /** Label text (<span> element) font-size CSS. Default: `null` */
  labelFontSize?: string | null;
  /** Label text (<span> element) max-width CSS property. Default: `null` */
  labelMaxWidth?: string | null;
  /** Bullet shape size, mapped to the width and height CSS properties. Default: `null` */
  bulletSize?: string | null;
  /** Bullet shape enum value or accessor function. Default: `d => d.shape ?? BulletShape.Circle */
  bulletShape?: GenericAccessor<BulletShape, BulletLegendItemInterface>;
  /** Legend orientation. When set to `BulletLegendOrientation.Vertical`, each legend item will
   * start on a new line. Default: `BulletLegendOrientation.Horizontal` */
  orientation?: BulletLegendOrientation | string;
  /** If set to true, the legend will be rendered directly into the HTML element provided to the constructor
   * without creating additional `div` element. Default: `false` */
  renderIntoProvidedDomNode?: boolean;
}

export const BulletLegendDefaultConfig: BulletLegendConfigInterface = {
  items: [],
  labelClassName: '',
  onLegendItemClick: undefined,
  labelFontSize: null,
  labelMaxWidth: null,
  bulletSize: null,
  bulletShape: d => d.shape ?? BulletShape.Circle,
  orientation: BulletLegendOrientation.Horizontal,
  renderIntoProvidedDomNode: false,
}
