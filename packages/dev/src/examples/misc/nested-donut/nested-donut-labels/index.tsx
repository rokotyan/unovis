import React from 'react'
import { VisSingleContainer, VisNestedDonut } from '@unovis/react'
import { generateNestedData, NestedDatum } from '@src/utils/data'

export const title = 'Nested Donut Layer Configuration'
export const subTitle = 'with inward/outward direction'

export const component = (): JSX.Element => {
  const config = {
    data: generateNestedData(100, 5),
    layers: [
      (d: NestedDatum) => d.group,
      (d: NestedDatum) => d.subgroup,
      (d: NestedDatum) => d.value,
    ],
    layerPadding: 10,
    layerSettings: (i: number) => [
      { width: 100 },
      { width: 50, rotateLabels: true },
      { width: 20 },
    ][i],
  }
  return (<>
    <VisSingleContainer height={500}>
      <VisNestedDonut {...config} direction={'outwards'}/>
    </VisSingleContainer>
    <VisSingleContainer height={500}>
      <VisNestedDonut {...config}/>
    </VisSingleContainer>
  </>
  )
}

