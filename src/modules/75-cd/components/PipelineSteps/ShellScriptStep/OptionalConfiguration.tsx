/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikProps, FieldArray, useFormikContext } from 'formik'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Text
} from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import { get } from 'lodash-es'
import cx from 'classnames'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isValueRuntimeInput } from '@common/utils/utils'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

import {
  scriptInputType,
  scriptOutputType,
  ShellScriptFormData,
  ShellScriptOutputStepVariable,
  ShellScriptStepVariable
} from './shellScriptTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ShellScript.module.scss'

export default function OptionalConfiguration(props: {
  formik: FormikProps<ShellScriptFormData>
  readonly?: boolean
  allowableTypes: AllowedTypes
  enableOutputVar?: boolean
}): React.ReactElement {
  const { formik, readonly, allowableTypes, enableOutputVar = true } = props
  const { values: formValues, setFieldValue } = formik
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <FormikForm>
      <div className={stepCss.stepPanel}>
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.environmentVariables"
            label={getString('pipeline.scriptInputVariables')}
            isOptional
            optionalLabel={getString('common.optionalLabel')}
            defaultValueToReset={[]}
            disableTypeSelection
            data-tooltip-id={`shellScriptInputVariable_${formValues?.spec?.shell}`}
            tooltipProps={{ dataTooltipId: `shellScriptInputVariable_${formValues?.spec?.shell}` }}
          >
            <FieldArray
              name="spec.environmentVariables"
              render={({ push, remove }) => {
                return (
                  <div className={css.panel}>
                    <div className={css.environmentVarHeader}>
                      <span className={css.label}>{getString('name')}</span>
                      <span className={css.label}>{getString('typeLabel')}</span>
                      <span className={css.label}>{getString('valueLabel')}</span>
                    </div>
                    {formValues.spec.environmentVariables?.map(({ id }: ShellScriptStepVariable, i: number) => {
                      return (
                        <div className={css.environmentVarHeader} key={id}>
                          <FormInput.Text
                            name={`spec.environmentVariables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={readonly}
                          />
                          <FormInput.Select
                            items={scriptInputType}
                            name={`spec.environmentVariables[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={readonly}
                          />
                          <OptionalVariables
                            variablePath={`spec.environmentVariables[${i}].value`}
                            variableTypePath={`spec.environmentVariables[${i}].type`}
                            allowableTypes={allowableTypes}
                            readonly={readonly}
                          />
                          <Button
                            variation={ButtonVariation.ICON}
                            icon="main-trash"
                            data-testid={`remove-environmentVar-${i}`}
                            onClick={() => remove(i)}
                            disabled={readonly}
                          />
                        </div>
                      )
                    })}
                    <Button
                      icon="plus"
                      variation={ButtonVariation.LINK}
                      data-testid="add-environmentVar"
                      disabled={readonly}
                      onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                      className={css.addButton}
                    >
                      {getString('addInputVar')}
                    </Button>
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
        {enableOutputVar ? (
          <div className={stepCss.formGroup}>
            <MultiTypeFieldSelector
              name="spec.outputVariables"
              label={getString('pipeline.scriptOutputVariables')}
              isOptional
              optionalLabel={getString('common.optionalLabel')}
              defaultValueToReset={[]}
              disableTypeSelection={false}
              data-tooltip-id={`shellScriptOutputVariable_${formValues?.spec?.shell}`}
              tooltipProps={{ dataTooltipId: `shellScriptOutputVariable_${formValues?.spec?.shell}` }}
            >
              <FieldArray
                name="spec.outputVariables"
                render={({ push, remove }) => {
                  return (
                    <div className={css.panel}>
                      <div className={css.outputVarHeader}>
                        <span className={css.label}>{getString('name')}</span>
                        <span className={css.label}>{getString('typeLabel')}</span>
                        <span className={css.label}>
                          {getString('cd.steps.shellScriptOutputVariablesLabel', {
                            scriptType: formValues?.spec?.shell
                          })}
                        </span>
                      </div>
                      {formValues.spec.outputVariables?.map(({ id }: ShellScriptOutputStepVariable, i: number) => {
                        return (
                          <div className={css.outputVarHeader} key={id}>
                            <FormInput.Text
                              name={`spec.outputVariables[${i}].name`}
                              placeholder={getString('name')}
                              disabled={readonly}
                            />
                            <FormInput.Select
                              items={scriptOutputType}
                              name={`spec.outputVariables[${i}].type`}
                              placeholder={getString('typeLabel')}
                              disabled={readonly}
                            />

                            <OptionalVariables
                              variablePath={`spec.outputVariables[${i}].value`}
                              allowableTypes={allowableTypes}
                              readonly={readonly}
                              variableTypePath={`spec.outputVariables[${i}].type`}
                            />

                            <Button minimal icon="main-trash" onClick={() => remove(i)} disabled={readonly} />
                          </div>
                        )
                      })}
                      <Button
                        icon="plus"
                        variation={ButtonVariation.LINK}
                        onClick={() => push({ name: '', type: 'String', value: '', id: uuid() })}
                        disabled={readonly}
                        className={css.addButton}
                      >
                        {getString('addOutputVar')}
                      </Button>
                    </div>
                  )
                }}
              />
            </MultiTypeFieldSelector>
          </div>
        ) : null}
        <div className={stepCss.formGroup}>
          <RadioGroup
            selectedValue={formValues.spec.onDelegate}
            disabled={readonly}
            inline={true}
            label={getString('pipeline.executionTarget') + ' ' + getString('common.optionalLabel')}
            onChange={e => {
              formik.setFieldValue('spec.onDelegate', e.currentTarget.value)
            }}
          >
            <Radio value={'targethost'} label={'Specify Target Host'} />
            <Radio value={'delegate'} label={'On Delegate'} />
          </RadioGroup>
        </div>
        {formValues.spec.onDelegate === 'targethost' ? (
          <div>
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInput.MultiTextInput
                name="spec.executionTarget.host"
                placeholder={getString('cd.specifyTargetHost')}
                label={getString('targetHost')}
                style={{ marginTop: 'var(--spacing-small)' }}
                multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
                disabled={readonly}
              />
              {getMultiTypeFromValue(formValues.spec.executionTarget.host) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={formValues.spec.executionTarget.host}
                  type="String"
                  variableName="spec.executionTarget.host"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={value => setFieldValue('spec.executionTarget.host', value)}
                  style={{ marginTop: 12 }}
                  isReadonly={readonly}
                />
              )}
            </div>
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <MultiTypeSecretInput
                type={formValues.spec.shell === 'PowerShell' ? 'WinRmCredentials' : 'SSHKey'}
                name="spec.executionTarget.connectorRef"
                label={
                  formValues.spec.shell === 'PowerShell' ? getString('secrets.typeWinRM') : getString('sshConnector')
                }
                expressions={expressions}
                allowableTypes={allowableTypes}
                disabled={readonly}
              />
              {getMultiTypeFromValue(formValues?.spec.executionTarget.connectorRef) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={formValues?.spec.executionTarget.connectorRef as string}
                  type={
                    <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                      <Text>{getString('pipelineSteps.connectorLabel')}</Text>
                    </Layout.Horizontal>
                  }
                  variableName="spec.executionTarget.connectorRef"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={value => {
                    setFieldValue('spec.executionTarget.connectorRef', value)
                  }}
                  style={{ marginTop: 4 }}
                  isReadonly={readonly}
                />
              )}
            </div>
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInput.MultiTextInput
                name="spec.executionTarget.workingDirectory"
                placeholder={getString('cd.enterWorkDirectory')}
                label={getString('workingDirectory')}
                style={{ marginTop: 'var(--spacing-medium)' }}
                disabled={readonly}
                multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
              />
              {getMultiTypeFromValue(formValues.spec.executionTarget.workingDirectory) ===
                MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={formValues.spec.executionTarget.workingDirectory}
                  type="String"
                  variableName="spec.executionTarget.workingDirectory"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={value => setFieldValue('spec.executionTarget.workingDirectory', value)}
                  style={{ marginTop: 12 }}
                  isReadonly={readonly}
                />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </FormikForm>
  )
}

export function OptionalVariables({
  variablePath,
  allowableTypes,
  readonly,
  variableTypePath
}: {
  variablePath: string
  variableTypePath?: string
  allowableTypes: AllowedTypes
  readonly?: boolean
}): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { values: formValues, setFieldValue } = useFormikContext()
  const variableValue = get(formValues, variablePath)
  const variableType = variableTypePath ? get(formValues, variableTypePath) : undefined
  const commasInAllowedValues = useFeatureFlag(FeatureFlag.PIE_MULTISELECT_AND_COMMA_IN_ALLOWED_VALUES)

  return (
    <Layout.Horizontal>
      <FormInput.MultiTextInput
        name={variablePath}
        placeholder={getString('valueLabel')}
        multiTextInputProps={{
          allowableTypes,
          expressions,
          disabled: readonly
        }}
        label=""
        disabled={readonly}
      />

      {isValueRuntimeInput(variableValue) && (
        <ConfigureOptions
          value={variableValue}
          type="String"
          variableName={variablePath}
          onChange={value => setFieldValue(variablePath, value)}
          isReadonly={readonly}
          tagsInputSeparator={commasInAllowedValues && variableType === 'String' ? '/[\n\r]/' : undefined}
        />
      )}
    </Layout.Horizontal>
  )
}
