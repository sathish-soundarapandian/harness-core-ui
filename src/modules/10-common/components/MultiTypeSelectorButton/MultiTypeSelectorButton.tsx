/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import {
  Button,
  Icon,
  MultiTypeInputMenu,
  MultiTypeInputType,
  MultiTypeIcon,
  MultiTypeIconSize,
  AllowedTypes
} from '@wings-software/uicore'
import { Popover } from '@blueprintjs/core'
import cx from 'classnames'
import css from './MultiTypeSelectorButton.module.scss'

export interface MultiTypeSelectorButtonProps {
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
    <Button minimal className={css.btn} withoutBoxShadow withoutCurrentColor disabled={disabled} {...props}>
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
