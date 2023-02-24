/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { get } from 'lodash-es'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { isValueRuntimeInput } from '@common/utils/utils'
import ConditionalExecutionPanelHeader from './ConditionalExecutionHeader'
import ConditionalExecutionPanelStatus from './ConditionalExecutionStatus'
import ConditionalExecutionPanelCondition from './ConditionalExecutionCondition'

import css from './ConditionalExecutionPanel.module.scss'

export interface ConditionalExecutionPanelProps {
  path: string
  mode: Modes
  isReadonly: boolean
}

export default function ConditionalExecutionPanel(props: ConditionalExecutionPanelProps): React.ReactElement {
  const { mode, isReadonly, path = 'when' } = props
  const formik = useFormikContext()
  const statusPath = mode === Modes.STAGE ? 'pipelineStatus' : 'stageStatus'

  const value = get(formik.values, path)

  return (
    <div className={css.main}>
      <ConditionalExecutionPanelHeader mode={mode} />
      {isValueRuntimeInput(value) ? (
        <FormInput.Text className={css.runtimeInput} name={path} disabled />
      ) : (
        <div className={css.panel}>
          <ConditionalExecutionPanelStatus path={path} statusPath={statusPath} isReadonly={isReadonly} mode={mode} />
          <div className={css.divider} />
          <ConditionalExecutionPanelCondition path={path} statusPath={statusPath} isReadonly={isReadonly} mode={mode} />
        </div>
      )}
    </div>
  )
}
