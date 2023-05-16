/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FC } from 'react';
import React from 'react'
import type {
  MultiTypeInputType,
  AllowedTypes,
  ButtonProps
} from '@harness/uicore';
import {
  Button,
  Icon,
  MultiTypeInputMenu,
  MultiTypeIcon,
  MultiTypeIconSize
} from '@harness/uicore'
import { Popover } from '@blueprintjs/core'
import cx from 'classnames'
import css from './MultiTypeSelectorButton.module.scss'

export interface MultiTypeSelectorButtonProps extends Omit<ButtonProps, 'type' | 'onChange'> {
  type: MultiTypeInputType
  onChange: (type: MultiTypeInputType) => void
  allowedTypes: AllowedTypes
  disabled?: boolean
}

const MultiTypeSelectorButton: FC<MultiTypeSelectorButtonProps> = ({
  type,
  onChange,
  allowedTypes,
  disabled,
  className,
  ...props
}) => (
  <Popover
    disabled={disabled}
    position="bottom-right"
    interactionKind="click"
    minimal
    wrapperTagName="div"
    targetTagName="div"
    className={css.typeSelectorWrapper}
    targetClassName={css.typeSelector}
    popoverClassName={css.popover}
  >
    <Button
      minimal
      className={cx(css.btn, className)}
      withoutBoxShadow
      withoutCurrentColor
      disabled={disabled}
      {...props}
    >
      <Icon
        className={cx(css.icon, (css as any)[type.toLowerCase()])}
        size={MultiTypeIconSize[type]}
        name={MultiTypeIcon[type]}
      />
    </Button>
    <MultiTypeInputMenu allowedTypes={allowedTypes} onTypeSelect={onChange} />
  </Popover>
)

export default MultiTypeSelectorButton
