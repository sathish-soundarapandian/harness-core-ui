/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, MultiTypeInputType } from '@harness/uicore'

import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { MultiTypeListInputSet } from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { MultiTypeMapInputSet } from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import type { AwsSamBuildStepInitialValues, AwsSamDeployStepInitialValues } from '@pipeline/utils/types'
import { getHasValuesAsRuntimeInputFromTemplate } from '@pipeline/utils/CIUtils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AwsSamBuildDeployStepInitialValues = AwsSamBuildStepInitialValues | AwsSamDeployStepInitialValues

interface AwsSamBuildDeployStepOptionalFieldsInputSetProps {
  initialValues: AwsSamBuildDeployStepInitialValues
  allowableTypes: AllowedTypes
  inputSetData: {
    allValues?: AwsSamBuildDeployStepInitialValues
    template?: AwsSamBuildDeployStepInitialValues
    path?: string
    readonly?: boolean
  }
  formik?: FormikProps<PipelineInfoConfig>
  isAwsSamBuildStep?: boolean
}

export function AwsSamBuildDeployStepOptionalFieldsInputSet(
  props: AwsSamBuildDeployStepOptionalFieldsInputSetProps
): React.ReactElement {
  const { inputSetData, allowableTypes, formik, isAwsSamBuildStep } = props
  const { template, path, readonly } = inputSetData

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const prefix = isEmpty(path) ? '' : `${path}.`

  const renderMultiTypeListInputSet = ({
    fieldName,
    fieldLabel
  }: {
    fieldName: string
    fieldLabel: keyof StringsMap
  }): React.ReactElement => (
    <div className={cx(stepCss.formGroup, stepCss.md)}>
      <MultiTypeListInputSet
        name={fieldName}
        multiTextInputProps={{
          expressions,
          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
        }}
        formik={formik}
        multiTypeFieldSelectorProps={{
          label: getString('optionalField', { name: getString(fieldLabel) }),
          allowedTypes: [MultiTypeInputType.FIXED]
        }}
        disabled={readonly}
      />
    </div>
  )

  const renderMultiTypeMapInputSet = ({
    fieldName,
    fieldLabel,
    keyLabel,
    valueLabel,
    restrictToSingleEntry,
    appliedInputSetValue,
    templateFieldName,
    keyValuePlaceholders
  }: {
    fieldName: string
    fieldLabel: keyof StringsMap
    keyLabel?: keyof StringsMap
    valueLabel?: keyof StringsMap
    restrictToSingleEntry?: boolean
    appliedInputSetValue?: { [key: string]: string }
    templateFieldName?: string
    keyValuePlaceholders?: Array<string>
  }): React.ReactElement => (
    <div className={cx(stepCss.formGroup, stepCss.md)}>
      <MultiTypeMapInputSet
        name={fieldName}
        valueMultiTextInputProps={{
          allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
          expressions
        }}
        multiTypeFieldSelectorProps={{
          label: getString('optionalField', { name: getString(fieldLabel) }),
          allowedTypes: [MultiTypeInputType.FIXED]
        }}
        disabled={readonly}
        formik={formik}
        keyLabel={keyLabel ? getString(keyLabel) : ''}
        valueLabel={valueLabel ? getString(valueLabel) : ''}
        restrictToSingleEntry={restrictToSingleEntry}
        appliedInputSetValue={appliedInputSetValue}
        hasValuesAsRuntimeInput={getHasValuesAsRuntimeInputFromTemplate({ template, templateFieldName })}
        keyValuePlaceholders={keyValuePlaceholders}
        configureOptionsProps={{ hideExecutionTimeField: true }}
      />
    </div>
  )

  return (
    <>
      {isValueRuntimeInput(
        get(template, isAwsSamBuildStep ? `spec.buildCommandOptions` : `spec.deployCommandOptions`)
      ) &&
        renderMultiTypeListInputSet({
          fieldName: isAwsSamBuildStep ? `${prefix}spec.buildCommandOptions` : `${prefix}spec.deployCommandOptions`,
          fieldLabel: isAwsSamBuildStep
            ? 'cd.steps.awsSamBuildStep.awsSamBuildCommandOptions'
            : 'cd.steps.awsSamDeployStep.awsSamDeployCommandOptions'
        })}

      {isValueRuntimeInput(get(template, `spec.stackName`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.stackName`}
            label={getString('optionalField', { name: getString('cd.cloudFormation.stackName') })}
            placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            fieldPath={`spec.stackName`}
            template={template}
          />
        </div>
      )}

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

      {!isEmpty(get(template, `spec.envVariables`)) &&
        renderMultiTypeMapInputSet({
          fieldName: `${prefix}spec.envVariables`,
          fieldLabel: 'environmentVariables',
          templateFieldName: 'spec.envVariables',
          appliedInputSetValue: get(formik?.values, `${prefix}spec.envVariables`)
        })}
    </>
  )
}
