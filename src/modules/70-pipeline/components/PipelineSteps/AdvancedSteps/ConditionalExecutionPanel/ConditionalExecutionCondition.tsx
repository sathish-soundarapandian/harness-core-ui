/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Container,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'
import { Checkbox } from '@blueprintjs/core'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { get, isNil } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { MultiTypeExecutionCondition } from '@common/components/MultiTypeExecutionCondition/MultiTypeExecutionCondition'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepMode as Modes } from '@pipeline/utils/stepUtils'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { ModeEntityNameMap, PipelineOrStageStatus } from './ConditionalExecutionPanelUtils'
import css from './ConditionalExecutionPanel.module.scss'

interface ConditionalExecutionConditionProps {
  path?: string
  mode: Modes
  isReadonly: boolean
  statusPath: 'pipelineStatus' | 'stageStatus'
}

export default function ConditionalExecutionCondition(props: ConditionalExecutionConditionProps): React.ReactElement {
  const { mode, isReadonly, path = 'when', statusPath } = props
  const { getString } = useStrings()
  const formik = useFormikContext()
  const conditionValue = get(formik.values, `${path}.condition`)
  const statusValue = get(formik.values, `${path}.${statusPath}`, PipelineOrStageStatus.SUCCESS)
  const [enableJEXL, setEnableJEXL] = React.useState(!isNil(conditionValue))
  const [multiType, setMultiType] = useState<MultiTypeInputType>(getMultiTypeFromValue(conditionValue))
  const isInputDisabled = !enableJEXL || isReadonly
  const { expressions } = useVariablesExpression()

  React.useEffect(() => {
    setEnableJEXL(!isNil(conditionValue))
  }, [conditionValue])

  React.useEffect(() => {
    if (isMultiTypeRuntime(multiType)) {
      formik.setFieldValue(path, { [statusPath]: statusValue, condition: RUNTIME_INPUT_VALUE })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiType])

  return (
    <div>
      <Checkbox
        name="enableJEXL"
        checked={enableJEXL}
        disabled={isReadonly}
        className={cx(css.blackText, { [css.active]: enableJEXL })}
        labelElement={
          <span data-tooltip-id="conditionalExecution">
            {getString('pipeline.conditionalExecution.condition', { entity: ModeEntityNameMap[mode] })}
            <HarnessDocTooltip tooltipId="conditionalExecution" useStandAlone={true} />
          </span>
        }
        onChange={e => {
          const isChecked = e.currentTarget.checked
          setEnableJEXL(isChecked)
          formik.setFieldValue(path, { [statusPath]: statusValue })
          if (!isChecked) {
            setMultiType(MultiTypeInputType.FIXED)
          }
        }}
      />
      <Container padding={{ top: 'small', left: 'large' }}>
        <MultiTypeExecutionCondition
          path={`${path}.condition`}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
          isInputDisabled={isInputDisabled}
          multiType={multiType}
          setMultiType={setMultiType}
          expressions={expressions}
        />
      </Container>
    </div>
  )
}
