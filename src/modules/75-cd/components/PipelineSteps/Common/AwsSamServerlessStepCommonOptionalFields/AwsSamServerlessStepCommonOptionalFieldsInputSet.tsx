/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import cx from 'classnames'
import type { AllowedTypes } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import type {
  AwsSamBuildStepInitialValues,
  AwsSamDeployStepInitialValues,
  ServerlessPrepareRollbackStepInitialValues
} from '@pipeline/utils/types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AwsSamServerlessStepInitialValues =
  | AwsSamBuildStepInitialValues
  | AwsSamDeployStepInitialValues
  | ServerlessPrepareRollbackStepInitialValues

interface AwsSamServerlessStepCommonOptionalFieldsInputSetProps {
  allowableTypes: AllowedTypes
  inputSetData: {
    allValues?: AwsSamServerlessStepInitialValues
    template?: AwsSamServerlessStepInitialValues
    path?: string
    readonly?: boolean
  }
}

export function AwsSamServerlessStepCommonOptionalFieldsInputSet(
  props: AwsSamServerlessStepCommonOptionalFieldsInputSetProps
): React.ReactElement {
  const { inputSetData, allowableTypes } = props
  const { template, path, readonly } = inputSetData

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {isValueRuntimeInput(get(template, `spec.privileged`)) && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.privileged`}
            label={getString('optionalField', { name: getString('pipeline.buildInfra.privileged') })}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly,
              width: 416.5
            }}
            tooltipProps={{ dataTooltipId: 'privileged' }}
            disabled={readonly}
          />
        </div>
      )}

      {isValueRuntimeInput(get(template, `spec.imagePullPolicy`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <SelectInputSetView
            name={`${prefix}spec.imagePullPolicy`}
            label={getString('optionalField', { name: getString('pipelineSteps.pullLabel') })}
            selectItems={getImagePullPolicyOptions(getString)}
            placeholder={getString('select')}
            disabled={readonly}
            useValue={true}
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: { addClearBtn: true, items: getImagePullPolicyOptions(getString) }
            }}
            template={template}
            fieldPath={`spec.imagePullPolicy`}
          />
        </div>
      )}

      {isValueRuntimeInput(get(template, `spec.runAsUser`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.runAsUser`}
            label={getString('optionalField', { name: getString('pipeline.stepCommonFields.runAsUser') })}
            placeholder="1000"
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.runAsUser`}
            template={template}
          />
        </div>
      )}

      {isValueRuntimeInput(get(template, `spec.resources.limits.memory`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.resources.limits.memory`}
            label={getString('optionalField', { name: getString('pipelineSteps.limitMemoryLabel') })}
            placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitMemoryLabel') })}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.resources.limits.memory`}
            template={template}
          />
        </div>
      )}

      {isValueRuntimeInput(get(template, `spec.resources.limits.cpu`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.resources.limits.cpu`}
            label={getString('optionalField', { name: getString('pipelineSteps.limitCPULabel') })}
            placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitCPULabel') })}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.resources.limits.cpu`}
            template={template}
          />
        </div>
      )}
    </>
  )
}
