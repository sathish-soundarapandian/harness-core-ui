/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, FormInput, getMultiTypeFromValue, MultiTypeInputType, Text } from '@harness/uicore'
import { toString } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { FormMultiTypeKVTagInput } from '@common/components/MutliTypeKVTagInput/MultiTypeKVTagInput'
import { InstancesType } from './TASBasicAppSetupTypes'
import type { TASBasicAppSetupData } from './TASBasicAppSetupStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TasSetupSource(props: {
  formik: FormikProps<TASBasicAppSetupData>
  isNewStep: boolean
  readonly?: boolean
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    isNewStep,
    readonly,
    stepViewType,
    allowableTypes
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <React.Fragment>
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
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            expressions,
            disabled: readonly,
            allowableTypes
          }}
          className={stepCss.duration}
          disabled={readonly}
        />
        {getMultiTypeFromValue(formValues?.timeout) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues?.timeout as string}
            type="String"
            variableName="step.timeout"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={
              /* istanbul ignore next */ value => {
                setFieldValue('timeout', value)
              }
            }
            isReadonly={readonly}
            allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
          />
        )}
      </div>

      <div className={stepCss.divider} />

      <FormInput.RadioGroup
        name="spec.instanceCount"
        label={<Text>{'Instance Count'}</Text>} // move to strings
        items={[
          {
            label: 'Read from Manifest',
            value: InstancesType.FromManifest
          },
          {
            label: 'Match Running Instances',
            value: InstancesType.MatchRunningInstances
          }
        ]}
        radioGroup={{ inline: true }}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          setFieldValue('spec.instanceCount', e.currentTarget.value as InstancesType)
        }}
        //   margin-bottom: var(--spacing-large);
      />

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name="spec.existingVersionToKeep"
          label={getString('cd.TASSteps.existingVersionToKeep')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes,
            textProps: { type: 'number' }
          }}
        />
        {getMultiTypeFromValue(formValues.spec.existingVersionToKeep) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={toString(formValues.spec.existingVersionToKeep)}
            type="Number"
            variableName="spec.existingVersionToKeep"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={/* istanbul ignore next */ value => setFieldValue('spec.existingVersionToKeep', value)}
            isReadonly={readonly}
            allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
          />
        )}
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormMultiTypeKVTagInput
          name="spec.additionalRoutes"
          tagsProps={{ placeholder: 'Type and press enter to add a route' }}
          multiTypeProps={{
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
          }}
          label={'Additional Routes'}
          enableConfigureOptions
          isArray={true}
        />
      </div>
    </React.Fragment>
  )
}
