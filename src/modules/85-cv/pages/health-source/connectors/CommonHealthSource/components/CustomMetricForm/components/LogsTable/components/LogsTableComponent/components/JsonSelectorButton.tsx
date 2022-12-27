import React from 'react'
import { Button, ButtonProps, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'

export type JsonSelectorButtonProps = ButtonProps & {
  displayText: string
  onClick: () => void
  className?: string
  isDisabled?: boolean
  icon?: IconName
}

export default function JsonSelectorButton({
  displayText,
  onClick,
  isDisabled,
  icon,
  className,
  ...otherProps
}: JsonSelectorButtonProps): JSX.Element {
  return (
    <Button
      minimal
      className={className}
      width="100%"
      withoutCurrentColor={true}
      rightIcon={icon}
      iconProps={{ size: 14, color: isDisabled ? Color.GREEN_300 : Color.PRIMARY_5 }}
      disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) {
          onClick()
        }
      }}
      {...otherProps}
    >
      {displayText}
    </Button>
  )
}
