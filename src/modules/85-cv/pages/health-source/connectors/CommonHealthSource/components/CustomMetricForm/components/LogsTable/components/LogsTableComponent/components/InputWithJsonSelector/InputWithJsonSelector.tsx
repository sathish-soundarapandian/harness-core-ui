import React from 'react'
import cx from 'classnames'
import { Button, ButtonProps, ButtonVariation, Container, FormInput } from '@harness/uicore'
import css from '../JsonSelectorButton.module.scss'

export type InputWithJsonSelectorProps = ButtonProps & {
  displayText: string
  onClick: () => void
  className?: string
  displayTextclassName?: string
  isDisabled?: boolean
  name: string
  isTemplate?: boolean
}

export default function InputWithJsonSelector({
  onClick,
  isDisabled,
  className,
  name,
  isTemplate
}: InputWithJsonSelectorProps): JSX.Element {
  return (
    <Container className={css.inputJsonButtonWrapper}>
      <FormInput.Text data-testid="inputWithJsonSelector_input" name={name} className={className} />
      <Button
        className={cx(css.inputJsonButton, {
          [css.inputJsonButtonTemplate]: isTemplate
        })}
        data-testid="jsonSelectorBtn"
        width="30px"
        variation={ButtonVariation.PRIMARY}
        disabled={isDisabled}
        onClick={() => {
          if (!isDisabled) {
            onClick()
          }
        }}
      >
        +
      </Button>
    </Container>
  )
}
