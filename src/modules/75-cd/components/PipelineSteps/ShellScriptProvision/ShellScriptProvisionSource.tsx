/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useState } from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, FormInput, getMultiTypeFromValue, MultiTypeInputType, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import ShellScriptProvisionConfig from './ShellScriptProvisionConfig'
import type { ShellScriptProvisionFileStore, ShellScriptProvisionFormData, ShellScriptProvisionInline } from './types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ShellScriptProvision.module.scss'

export enum LocationType {
  HARNESS = 'Harness',
  INLINE = 'Inline'
}

export default function ShellScriptProvisionSource(props: {
  formik: FormikProps<ShellScriptProvisionFormData>
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

  const [locationType, setLocationType] = useState<LocationType>(
    (formik.values as ShellScriptProvisionFormData).spec.source?.type as LocationType
  )

  const onLocationChange = (value: LocationType) => {
    setLocationType(value)
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
          multiTypeDurationProps={{ enableConfigureOptions: false, expressions, disabled: readonly, allowableTypes }}
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
        name="spec.source.type"
        label={getString('cd.steps.commands.selectScriptLocation')}
        items={[
          {
            label: getString('inline'),
            value: LocationType.INLINE
          },
          {
            label: getString('cd.steps.commands.locationFileStore'),
            value: LocationType.HARNESS
          }
        ]}
        radioGroup={{ inline: true }}
        onChange={(e: FormEvent<HTMLInputElement>) => {
          onLocationChange(e.currentTarget.value as LocationType)
        }}
      />
      {locationType === LocationType.INLINE && (
        <div className={cx(stepCss.formGroup, css.scriptField)}>
          <MultiTypeFieldSelector
            name="spec.source.spec.script"
            label={getString('common.script')}
            defaultValueToReset=""
            disabled={readonly}
            allowedTypes={allowableTypes}
            disableTypeSelection={readonly}
            skipRenderValueInExpressionLabel
            expressionRender={() => {
              return (
                <ShellScriptMonacoField
                  name="spec.source.spec.script"
                  scriptType={'Bash'}
                  disabled={readonly}
                  expressions={expressions}
                />
              )
            }}
          >
            <ShellScriptMonacoField
              name="spec.source.spec.script"
              scriptType={'Bash'}
              disabled={readonly}
              expressions={expressions}
              title={getString('common.script')}
            />
          </MultiTypeFieldSelector>
          {getMultiTypeFromValue(
            ((formik.values as ShellScriptProvisionFormData).spec.source?.spec as ShellScriptProvisionInline)?.script
          ) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={
                ((formik.values as ShellScriptProvisionFormData).spec.source?.spec as ShellScriptProvisionInline)
                  ?.script as string
              }
              type="String"
              variableName="spec.source.spec.script"
              className={css.minConfigBtn}
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={/* istanbul ignore next */ value => formik.setFieldValue('spec.source.spec.script', value)}
              isReadonly={readonly}
            />
          )}
        </div>
      )}
      {locationType === LocationType.HARNESS && (
        <ShellScriptProvisionConfig
          name="spec.source.spec.file"
          fileType={'fileStore'}
          formik={formik}
          expressions={expressions}
          values={defaultTo((formik.values.spec.source?.spec as ShellScriptProvisionFileStore)?.file, '')}
          multiTypeFieldSelectorProps={{
            disableTypeSelection: false,
            label: (
              <Text color={Color.GREY_600} padding={{ bottom: 4 }}>
                {getString('fileFolderPathText')}
              </Text>
            )
          }}
        />
      )}
    </>
  )
}
