import React from 'react'
import { Button, ButtonProps, ButtonVariation } from '@harness/uicore'

export type StageControlsProps = ButtonProps

export function StageControlButton({ icon, iconProps, title, ...rest }: StageControlsProps): React.ReactElement {
  return (
    <Button variation={ButtonVariation.LINK} minimal icon={icon} iconProps={iconProps} {...rest}>
      {title}
    </Button>
  )
}
