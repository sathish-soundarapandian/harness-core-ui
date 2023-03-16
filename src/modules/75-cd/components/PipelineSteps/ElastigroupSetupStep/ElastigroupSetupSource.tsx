/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useState } from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, FormInput, getMultiTypeFromValue, MultiTypeInputType, Text } from '@harness/uicore'
import { toString } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { ElastigroupSetupData, InstancesType } from './ElastigroupSetupTypes'
import type { ElastigroupBGStageSetupData } from '../ElastigroupBGStageSetupStep/ElastigroupBGStageSetupStepTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ElastigroupSetupStep.module.scss'

export default function ElastigroupSetupSource(props: {
  formik: FormikProps<ElastigroupSetupData> | FormikProps<ElastigroupBGStageSetupData>
  isNewStep: boolean
  readonly?: boolean
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const {
    formik,
    formik: { values: formValues, setFieldValue },
    isNewStep,
    readonly,
    stepViewType,
    allowableTypes
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const [instancesType, setInstancesType] = useState<InstancesType>(
    (formik.values as ElastigroupSetupData).spec.instances.type as InstancesType
  )

  const onTypeChange = (value: InstancesType) => {
    setInstancesType(value)
  }

  return (
    <>
      {stepViewType !== StepViewType.Template && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.InputWithIdentifier
            inputLabel={getString('pipelineSteps.stepNameLabel')}
            isIdentifierEditable={isNewStep && !readonly}
            inputGroupProps={{
              placeholder: getString('pipeline.stepNamePlaceholder'),
              disabled: readonly
            }}
          />
        </div>
      )}

      <div className={cx(stepCss.formGroup, stepCss.sm)}>
        <FormMultiTypeDurationField
          name="timeout"
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{ enableConfigureOptions: true, expressions, disabled: readonly, allowableTypes }}
          className={stepCss.duration}
          disabled={readonly}
        />
      </div>

      <div className={stepCss.divider} />

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name="spec.name"
          placeholder={getString('cd.ElastigroupStep.appName')}
          label={getString('cd.ElastigroupStep.appName')}
          disabled={readonly}
          multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
        />
        {getMultiTypeFromValue(formValues.spec.name) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.name}
            type="String"
            variableName="spec.name"
            showRequiredField={false}
            showDefaultField={false}
            onChange={/* istanbul ignore next */ value => setFieldValue('spec.name', value)}
            isReadonly={readonly}
            allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
          />
        )}
      </div>

      <FormInput.RadioGroup
        name="spec.instances.type"
        label={<Text className={css.instanceStyle}>{getString('instanceFieldOptions.instances')}</Text>}
        items={[
          {
            label: 'Same as already running Instances',
            value: InstancesType.CurrentRunning
          },
          {
            label: 'Fixed',
            value: InstancesType.Fixed
          }
        ]}
        radioGroup={{ inline: true }}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          onTypeChange(e.currentTarget.value as InstancesType)
        }}
        className={css.radioBtn}
      />

      {instancesType === InstancesType.Fixed && (
        <div>
          <div className={cx(stepCss.formGroup, stepCss.lg)}>
            <FormInput.MultiTextInput
              name="spec.instances.spec.min"
              placeholder={getString('cd.ElastigroupStep.minInstances')}
              label={getString('cd.ElastigroupStep.minInstances')}
              disabled={readonly}
              multiTextInputProps={{ expressions, disabled: readonly, allowableTypes, textProps: { type: 'number' } }}
            />
            {getMultiTypeFromValue(formValues.spec.instances.spec.min) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={toString(formValues.spec.instances.spec.min)}
                type="Number"
                variableName="spec.instances.spec.min"
                showRequiredField={false}
                showDefaultField={false}
                onChange={/* istanbul ignore next */ value => setFieldValue('spec.instances.spec.min', value)}
                isReadonly={readonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
              />
            )}
          </div>
          <div className={cx(stepCss.formGroup, stepCss.lg)}>
            <FormInput.MultiTextInput
              name="spec.instances.spec.max"
              placeholder={getString('cd.ElastigroupStep.maxInstances')}
              label={getString('cd.ElastigroupStep.maxInstances')}
              disabled={readonly}
              multiTextInputProps={{ expressions, disabled: readonly, allowableTypes, textProps: { type: 'number' } }}
            />
            {getMultiTypeFromValue(formValues.spec.instances.spec.max) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={toString(formValues.spec.instances.spec.max)}
                type="Number"
                variableName="spec.instances.spec.max"
                showRequiredField={false}
                showDefaultField={false}
                onChange={/* istanbul ignore next */ value => setFieldValue('spec.instances.spec.max', value)}
                isReadonly={readonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
              />
            )}
          </div>
          <div className={cx(stepCss.formGroup, stepCss.lg, stepCss.bottomMargin4)}>
            <FormInput.MultiTextInput
              name="spec.instances.spec.desired"
              placeholder={getString('cd.ElastigroupStep.desiredInstances')}
              label={getString('cd.ElastigroupStep.desiredInstances')}
              disabled={readonly}
              multiTextInputProps={{ expressions, disabled: readonly, allowableTypes, textProps: { type: 'number' } }}
            />
            {getMultiTypeFromValue(formValues.spec.instances.spec.desired) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={toString(formValues.spec.instances.spec.desired)}
                type="Number"
                variableName="spec.instances.spec.desired"
                showRequiredField={false}
                showDefaultField={false}
                onChange={/* istanbul ignore next */ value => setFieldValue('spec.instances.spec.desired', value)}
                isReadonly={readonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
