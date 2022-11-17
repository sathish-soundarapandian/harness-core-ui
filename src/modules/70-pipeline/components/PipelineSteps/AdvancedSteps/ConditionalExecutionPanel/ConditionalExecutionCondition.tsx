/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, getMultiTypeFromValue, HarnessDocTooltip, MultiTypeInputType } from '@harness/uicore'
import { Checkbox } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { MultiTypeExecutionCondition } from '@common/components/MultiTypeExecutionCondition/MultiTypeExecutionCondition'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepMode as Modes } from '@pipeline/utils/stepUtils'
import type { ConditionalExecutionOption } from './ConditionalExecutionPanelUtils'
import { ModeEntityNameMap } from './ConditionalExecutionPanelUtils'
import css from './ConditionalExecutionPanel.module.scss'

interface ConditionalExecutionConditionProps {
  formikProps: FormikProps<ConditionalExecutionOption>
  mode: Modes
  isReadonly: boolean
}

export default function ConditionalExecutionCondition(props: ConditionalExecutionConditionProps): React.ReactElement {
  const { getString } = useStrings()
  const { formikProps, mode, isReadonly } = props
  const conditionValue = formikProps.values?.condition
  const [multiType, setMultiType] = useState<MultiTypeInputType>(getMultiTypeFromValue(conditionValue))
  const isInputDisabled = !formikProps.values.enableJEXL || isReadonly
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Checkbox
        name="enableJEXL"
        checked={formikProps.values.enableJEXL}
        disabled={isReadonly}
        className={cx(css.blackText, { [css.active]: formikProps.values.enableJEXL })}
        labelElement={
          <span data-tooltip-id="conditionalExecution">
            {getString('pipeline.conditionalExecution.condition', { entity: ModeEntityNameMap[mode] })}
            <HarnessDocTooltip tooltipId="conditionalExecution" useStandAlone={true} />
          </span>
        }
        onChange={e => {
          const isChecked = e.currentTarget.checked
          formikProps.setFieldValue('enableJEXL', isChecked)
          if (!isChecked) {
            formikProps.setFieldValue('condition', null)
            setMultiType(MultiTypeInputType.FIXED)
          }
        }}
      />
      <Container padding={{ top: 'small', left: 'large' }}>
        <MultiTypeExecutionCondition
          path={'condition'}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
          isInputDisabled={isInputDisabled}
          multiType={multiType}
          setMultiType={setMultiType}
          expressions={expressions}
        />
      </Container>
    </>
  )
}
