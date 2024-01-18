import React, { useEffect, useRef, useState } from 'react'
import { VisControls as UnovisControls, VisControlsConfigInterface } from '@unovis/ts'

export const VisControlsSelectors = UnovisControls.selectors

export type VisControlsProps = VisControlsConfigInterface

export function VisControls (props: VisControlsProps): JSX.Element {
  const container = useRef<HTMLDivElement>(null)
  const [component, setComponent] = useState<UnovisControls>()

  // On Mount
  useEffect(() => {
    const c = new UnovisControls(container.current as HTMLDivElement, props)
    setComponent(c)

    return () => c?.destroy()
  }, [])

  // On Props Update
  useEffect(() => {
    component?.update(props)
  })

  return <div ref={container} />
}
