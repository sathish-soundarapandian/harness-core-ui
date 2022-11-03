/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ButtonGroup, Button, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { StepsType } from '../Constants'
import css from './RollbackToggleSwitch.module.scss'

export interface RollbackToggleSwitchProps {
  active?: StepsType
  style?: React.CSSProperties
  disabled?: boolean
  large?: boolean
  onChange?: (type: StepsType) => void
}

export function RollbackToggleSwitch({
  style = {},
  disabled = false,
  large = true,
  active = StepsType.Normal,
  onChange
}: RollbackToggleSwitchProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <div style={style} className={cx(css.rollbackToggle, { [css.rollbackToggleSmall]: !large })}>
      {large && (
        <Text
          onClick={e => {
            e.stopPropagation()
            if (active === StepsType.Rollback) {
              onChange?.(StepsType.Normal)
            }
          }}
          className={cx({ [css.activeText]: active === StepsType.Rollback })}
        >
          {getString('executionText')}
        </Text>
      )}
      <span className={css.btnRollback}>
        <ButtonGroup className={css.buttonGroup}>
          <Button
            icon="execution"
            active={active === StepsType.Normal}
            tooltip={large ? undefined : getString('executionText')}
            disabled={disabled}
            className={cx(css.btn, { [css.btnSmall]: !large })}
            iconProps={{ size: large ? 12 : 8 }}
            onClick={e => {
              e.stopPropagation()
              onChange?.(StepsType.Normal)
            }}
          />
          <Button
            icon="rollback-execution"
            active={active === StepsType.Rollback}
            tooltip={large ? undefined : getString('rollbackLabel')}
            iconProps={{ size: large ? 12 : 8 }}
            className={cx(css.btn, { [css.btnSmall]: !large })}
            disabled={disabled}
            onClick={e => {
              e.stopPropagation()
              onChange?.(StepsType.Rollback)
            }}
          />
        </ButtonGroup>
      </span>
      {large && (
        <Text
          onClick={e => {
            e.stopPropagation()
            if (active === StepsType.Normal) {
              onChange?.(StepsType.Rollback)
            }
          }}
          className={cx({ [css.activeText]: active === StepsType.Normal })}
        >
          {getString('rollbackLabel')}
        </Text>
      )}
    </div>
  )
}
