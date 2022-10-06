/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, AllowedTypes } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepElementConfig } from 'services/cd-ng'

import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface FetchInstanceScriptInputStepProps {
  initialValues: StepElementConfig
  onUpdate?: (data: StepElementConfig) => void
  onChange?: (data: StepElementConfig) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: StepElementConfig
  path?: string
}

export function FetchInstanceScriptInputStep(props: FetchInstanceScriptInputStepProps): React.ReactElement {
  const { template, path, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = defaultTo(path, '')

  return (
    <FormikForm>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
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
    </FormikForm>
  )
}
