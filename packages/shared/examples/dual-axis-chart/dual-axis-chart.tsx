import React from 'react'
import { VisXYContainer, VisArea, VisLine, VisAxis } from '@unovis/react'

import { XYDataRecord, generateXYDataRecords } from './data'

export default function component (): JSX.Element {
  const margin = { left: 100, right: 100, top: 40, bottom: 60 }
  const style: React.CSSProperties = { position: 'absolute', top: 0, left: 0, width: '100%', height: '40vh' }
  return (<>
    <VisXYContainer
      data={generateXYDataRecords(150)}
      margin={margin}
      autoMargin={false}
      width= {'100%'}
      height= {'40vh'}
    >
      <VisArea<XYDataRecord> x={d => d.x} y={(d: XYDataRecord, i: number) => i * (d.y || 0)} opacity={0.9} />
      <VisAxis type='x' numTicks={3} tickFormat={(x: number) => `${x}ms`} label='Time' />
      <VisAxis type='y'
        tickFormat={(y: number) => `${y}bps`}
        tickTextWidth={60}
        tickTextColor='#4D8CFD'
        labelColor='#4D8CFD'
        label='Traffic'
      />
    </VisXYContainer>
    <VisXYContainer
      data={generateXYDataRecords(150)}
      yDomain={[0, 150]}
      margin={margin}
      autoMargin={false}
      style={style}
    >
      <VisLine<XYDataRecord> x={d => d.x} y={d => 20 + 10 * (d.y2 || 0)} color='#FF6B7E' />
      <VisAxis
        type='y'
        position={'right'}
        tickFormat={(y: number) => `${y}db`}
        gridLine={false}
        tickTextColor='#FF6B7E'
        labelColor='#FF6B7E'
        label='Signal Strength'
      />
    </VisXYContainer>
  </>
  )
}
