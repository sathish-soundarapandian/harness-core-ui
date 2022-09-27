/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@wings-software/uicore'
import { get, defaultTo } from 'lodash-es'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import type { MergePRStepData } from './MergePrStep'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface MergePrInputStepProps {
  initialValues: MergePRStepData
  onUpdate?: (data: MergePRStepData) => void
  onChange?: (data: MergePRStepData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: MergePRStepData
  path?: string
}

export default function MergePRInputStep(props: MergePrInputStepProps): React.ReactElement {
  const { template, path, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = defaultTo(path, '')

  return (
    <>
      {getMultiTypeFromValue(get(template, 'timeout', '')) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            fieldPath={'timeout'}
            template={template}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}.timeout`}
            disabled={readonly}
          />
        </div>
      )}
    </>
  )
}
