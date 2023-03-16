import React from 'react'
import { Button, ButtonProps, Container, FormInput, IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import css from './JsonSelectorButton.module.scss'

export type JsonSelectorButtonProps = ButtonProps & {
  displayText: string
  onClick: () => void
  className?: string
  displayTextclassName?: string
  isDisabled?: boolean
  icon?: IconName
  name: string
}

export default function JsonSelectorButton({
  displayText,
  onClick,
  isDisabled,
  icon,
  className,
  displayTextclassName,
  name,
  ...otherProps
}: JsonSelectorButtonProps): JSX.Element {
  return (
    <FormInput.CustomRender
      name={name}
      className={css.jsonSelectorButton}
      render={() => {
        return (
          <Button
            minimal
            className={className}
            data-testid="jsonSelectorBtn"
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
            <Container className={displayTextclassName}>{displayText}</Container>
          </Button>
        )
      }}
    />
  )
}
