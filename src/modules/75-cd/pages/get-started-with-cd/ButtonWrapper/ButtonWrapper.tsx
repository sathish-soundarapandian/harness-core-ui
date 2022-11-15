/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, MarginProps } from '@harness/uicore'
import { Spacing, Intent } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import css from './ButtonWrapper.module.scss'

interface ButtonWrpperProps {
  onClick: (item: string) => void
  intent: Intent
  margin?: Spacing | MarginProps
  className?: string
  label?: string
  option: {
    label: string
    value: string
    disabled?: boolean
  }
}

export default function ButtonWrapper({
  onClick,
  intent,
  margin,
  className,
  option,
  label = ''
}: ButtonWrpperProps): JSX.Element {
  const { value, disabled } = option
  return (
    <Button
      className={cx(css.buttonWrapper, className)}
      text={label}
      onClick={_e => {
        onClick(value)
      }}
      intent={defaultTo(intent, Intent.NONE)}
      margin={margin}
      round
      inline
      disabled={defaultTo(disabled, false)}
    />
  )
}
