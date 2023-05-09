/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  FormikForm,
  AllowedTypes,
  MultiSelectOption,
  SelectOption
} from '@harness/uicore'
import { isEmpty, get, isArray, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { FieldArray, useFormikContext } from 'formik'

import { useStrings } from 'framework/strings'
import type { SecretDTOV2 } from 'services/cd-ng'
import { ShellScriptMonacoField, ScriptType } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import {
  MultiSelectVariableAllowedValues,
  concatValuesWithQuotes,
  isFixedInput
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/MultiSelectVariableAllowedValues/MultiSelectVariableAllowedValues'
import { getAllowedValuesFromTemplate, shouldRenderRunTimeInputViewWithAllowedValues } from '@pipeline/utils/CIUtils'
import { scriptInputType, scriptOutputType, ShellScriptData, ShellScriptFormData } from './shellScriptTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ShellScript.module.scss'

export interface ShellScriptInputSetStepProps {
  initialValues: ShellScriptFormData
  onUpdate?: (data: ShellScriptFormData) => void
  onChange?: (data: ShellScriptFormData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ShellScriptData
  path?: string
  connectorType: Exclude<SecretDTOV2['type'], 'SecretFile' | 'SecretText'>
  shellScriptType?: ScriptType
}

type variablesInfo = {
  selectOption: SelectOption[]
  variableType: 'String' | 'Number' | 'Secret'
  variableValue: string
}
const getMultiSelectProps = (
  template: ShellScriptData,
  initialValues: ShellScriptFormData,
  path: string
): variablesInfo => {
  const selectOpt = defaultTo(getAllowedValuesFromTemplate(template, `${path}.value`), [])
  const variableValue = get(initialValues, `${path}.value`, '')
  const variableType = get(initialValues, `${path}.type`, 'String') as 'String' | 'Number' | 'Secret'

  return {
    selectOption: selectOpt,
    variableType,
    variableValue
  }
}

export default function ShellScriptInputSetStep(props: ShellScriptInputSetStepProps): React.ReactElement {
  const { template, path, readonly, initialValues, allowableTypes, stepViewType, connectorType, shellScriptType } =
    props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const scriptType: ScriptType = get(initialValues, 'spec.shell') || 'Bash'
  const prefix = isEmpty(path) ? '' : `${path}.`
  const isExecutionTimeFieldDisabledForStep = isExecutionTimeFieldDisabled(stepViewType)
  const multiSelectSupportForAllowedValues = useFeatureFlag(FeatureFlag.PIE_MULTISELECT_AND_COMMA_IN_ALLOWED_VALUES)
  const formik = useFormikContext()

  return (
    <FormikForm>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.source?.spec?.script) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <MultiTypeFieldSelector
            name={`${prefix}spec.source.spec.script`}
            label={getString('common.script')}
            defaultValueToReset=""
            disabled={readonly}
            allowedTypes={allowableTypes}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
            }}
            disableTypeSelection={readonly}
            skipRenderValueInExpressionLabel
            expressionRender={() => {
              return (
                <ShellScriptMonacoField
                  name={`${prefix}spec.source.spec.script`}
                  scriptType={scriptType}
                  disabled={readonly}
                  expressions={expressions}
                />
              )
            }}
          >
            <ShellScriptMonacoField
              name={`${prefix}spec.source.spec.script`}
              scriptType={scriptType}
              disabled={readonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
      {isArray(template?.spec?.environmentVariables) && template?.spec?.environmentVariables ? (
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.environmentVariables"
            label={getString('pipeline.scriptInputVariables')}
            defaultValueToReset={[]}
            disableTypeSelection
            data-tooltip-id={`shellScriptInputVariable_${shellScriptType}`}
            tooltipProps={{ dataTooltipId: `shellScriptInputVariable_${shellScriptType}` }}
          >
            <FieldArray
              name="spec.environmentVariables"
              render={() => {
                return (
                  <div className={css.panel}>
                    <div className={css.environmentVarHeader}>
                      <span className={css.label}>{getString('name')}</span>
                      <span className={css.label}>{getString('typeLabel')}</span>
                      <span className={css.label}>{getString('valueLabel')}</span>
                    </div>
                    {template.spec.environmentVariables?.map((type, i: number) => {
                      const variableInfo = getMultiSelectProps(
                        template,
                        initialValues,
                        `spec.environmentVariables[${i}]`
                      )
                      const allowMultiSelectAllowedValues =
                        multiSelectSupportForAllowedValues &&
                        variableInfo.variableType === 'String' &&
                        shouldRenderRunTimeInputViewWithAllowedValues(
                          `spec.environmentVariables[${i}].value`,
                          template
                        ) &&
                        isFixedInput(formik, `${prefix}spec.environmentVariables[${i}].value`)
                      return (
                        <div className={css.environmentVarHeader} key={type.value}>
                          <FormInput.Text
                            name={`${prefix}spec.environmentVariables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />

                          <FormInput.Select
                            items={scriptInputType}
                            name={`${prefix}spec.environmentVariables[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />
                          {allowMultiSelectAllowedValues ? (
                            <MultiSelectVariableAllowedValues
                              name={`${prefix}spec.environmentVariables[${i}].value`}
                              allowableTypes={allowableTypes}
                              disabled={readonly}
                              selectOption={variableInfo.selectOption}
                              onChange={val => {
                                const finalValue =
                                  getMultiTypeFromValue(val) === MultiTypeInputType.FIXED
                                    ? concatValuesWithQuotes(val as MultiSelectOption[])
                                    : val
                                formik.setFieldValue(`${prefix}spec.environmentVariables[${i}].value`, finalValue)
                              }}
                              label=""
                            />
                          ) : (
                            <TextFieldInputSetView
                              name={`${prefix}spec.environmentVariables[${i}].value`}
                              multiTextInputProps={{
                                allowableTypes,
                                expressions,
                                disabled: readonly,
                                defaultValueToReset: ''
                              }}
                              label=""
                              placeholder={getString('valueLabel')}
                              fieldPath={`spec.environmentVariables[${i}].value`}
                              template={template}
                              enableConfigureOptions
                              configureOptionsProps={{
                                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
      {isArray(template?.spec?.outputVariables) && template?.spec?.outputVariables ? (
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.outputVariables"
            label={getString('pipeline.scriptOutputVariables')}
            defaultValueToReset={[]}
            disableTypeSelection
            data-tooltip-id={`shellScriptOutputVariable_${shellScriptType}`}
            tooltipProps={{ dataTooltipId: `shellScriptOutputVariable_${shellScriptType}` }}
          >
            <FieldArray
              name="spec.outputVariables"
              render={() => {
                return (
                  <div className={css.panel}>
                    <div className={css.outputVarHeader}>
                      <span className={css.label}>{getString('name')}</span>
                      <span className={css.label}>{getString('typeLabel')}</span>
                      <span className={css.label}>
                        {getString('cd.steps.shellScriptOutputVariablesLabel', { scriptType: shellScriptType })}
                      </span>
                    </div>
                    {template.spec.outputVariables?.map((output, i: number) => {
                      const variableInfo = getMultiSelectProps(template, initialValues, `spec.outputVariables[${i}]`)
                      const allowMultiSelectAllowedValues =
                        multiSelectSupportForAllowedValues &&
                        variableInfo.variableType === 'String' &&
                        shouldRenderRunTimeInputViewWithAllowedValues(`spec.outputVariables[${i}].value`, template) &&
                        isFixedInput(formik, `${prefix}spec.outputVariables[${i}].value`)
                      return (
                        <div className={css.outputVarHeader} key={output.name}>
                          <FormInput.Text
                            name={`${prefix}spec.outputVariables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />

                          <FormInput.Select
                            items={scriptOutputType}
                            name={`${prefix}spec.outputVariables[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />

                          {allowMultiSelectAllowedValues ? (
                            <MultiSelectVariableAllowedValues
                              name={`${prefix}spec.outputVariables[${i}].value`}
                              allowableTypes={allowableTypes}
                              disabled={readonly}
                              selectOption={variableInfo.selectOption}
                              onChange={val => {
                                const finalValue =
                                  getMultiTypeFromValue(val) === MultiTypeInputType.FIXED
                                    ? concatValuesWithQuotes(val as MultiSelectOption[])
                                    : val
                                formik.setFieldValue(`${prefix}spec.outputVariables[${i}].value`, finalValue)
                              }}
                              label=""
                            />
                          ) : (
                            <TextFieldInputSetView
                              name={`${prefix}spec.outputVariables[${i}].value`}
                              multiTextInputProps={{
                                allowableTypes,
                                expressions,
                                disabled: readonly,
                                defaultValueToReset: ''
                              }}
                              label=""
                              placeholder={getString('valueLabel')}
                              fieldPath={`spec.outputVariables[${i}].value`}
                              template={template}
                              enableConfigureOptions
                              configureOptionsProps={{
                                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
                              }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.executionTarget?.host) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          placeholder={getString('cd.specifyTargetHost')}
          label={getString('targetHost')}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
          }}
          disabled={readonly}
          name={`${prefix}spec.executionTarget.host`}
          fieldPath={`spec.executionTarget.host`}
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.executionTarget?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeSecretInput
            type={connectorType}
            expressions={expressions}
            allowableTypes={allowableTypes}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
            }}
            name={`${prefix}spec.executionTarget.connectorRef`}
            label={connectorType === 'SSHKey' ? getString('sshConnector') : getString('secrets.typeWinRM')}
            disabled={readonly}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.executionTarget?.workingDirectory) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          disabled={readonly}
          placeholder={getString('cd.enterWorkDirectory')}
          label={getString('workingDirectory')}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabledForStep
          }}
          name={`${prefix}spec.executionTarget.workingDirectory`}
          fieldPath={`spec.executionTarget.workingDirectory`}
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
    </FormikForm>
  )
}
