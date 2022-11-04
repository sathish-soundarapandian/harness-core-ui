/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import React from 'react'
import classNames from 'classnames'
import { FormInstanceDropdown } from '@common/components'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ElastigroupDeployStepInfo } from 'services/cd-ng'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ElastigroupDeployInputStepProps {
  initialValues: ElastigroupDeployStepInfo
  onUpdate?: (data: ElastigroupDeployStepInfo) => void
  onChange?: (data: ElastigroupDeployStepInfo) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: ElastigroupDeployStepInfo
  readonly?: boolean
  path?: string
}

export const ElastigroupDeployInputStep: React.FC<ElastigroupDeployInputStepProps> = ({
  template,
  readonly,
  path,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={classNames(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
          />
        </div>
      ) : null}
      {(getMultiTypeFromValue(template?.spec?.newService?.spec?.count) === MultiTypeInputType.RUNTIME ||
        getMultiTypeFromValue(template?.spec?.newService?.spec?.percentage) === MultiTypeInputType.RUNTIME) && (
        <div className={classNames(stepCss.formGroup, stepCss.md)}>
          <FormInstanceDropdown
            expressions={expressions}
            label={getString('common.instanceLabel')}
            name={`${prefix}spec.newService`}
            allowableTypes={allowableTypes}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            disabledType
            readonly={readonly}
          />
        </div>
      )}
      {(getMultiTypeFromValue(template?.spec?.oldService?.spec?.count) === MultiTypeInputType.RUNTIME ||
        getMultiTypeFromValue(template?.spec?.oldService?.spec?.percentage) === MultiTypeInputType.RUNTIME) && (
        <div className={classNames(stepCss.formGroup, stepCss.md)}>
          <FormInstanceDropdown
            expressions={expressions}
            label={getString('common.instanceLabel')}
            name={`${prefix}spec.oldService`}
            allowableTypes={allowableTypes}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            disabledType
            readonly={readonly}
          />
        </div>
      )}
    </>
  )
}
