// Utils
import { defineDefaults } from '@/utils/data'

// Types
import { ResolvedConfig } from '@/types/misc'

// Local Types
import { VisControlItemInterface, VisControlsOrientation } from './types'

export interface VisControlsConfigInterface {
  /** Controls items array, VisControlItemInterface[]. Default: `[]` */
  items?: VisControlItemInterface[];
  /** Controls orientation. `VisControlsOrientation.Horizontal` or `VisControlsOrientation.Horizontal`. Default: `VisControlsOrientation.Horizontal` */
  orientation?: VisControlsOrientation;
}

export const VisControlsDefaultConfig = defineDefaults<VisControlsConfigInterface>()({
  items: [],
  orientation: VisControlsOrientation.Horizontal,
})

export type VisControlsResolvedConfig = ResolvedConfig<VisControlsConfigInterface, typeof VisControlsDefaultConfig>

