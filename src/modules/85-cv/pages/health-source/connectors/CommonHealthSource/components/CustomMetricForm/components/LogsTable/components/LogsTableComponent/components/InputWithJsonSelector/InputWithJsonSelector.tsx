/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
