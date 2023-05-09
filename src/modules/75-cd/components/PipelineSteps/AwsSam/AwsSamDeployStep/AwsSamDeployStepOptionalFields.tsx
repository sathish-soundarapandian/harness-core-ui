/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, Container, FormInput, getMultiTypeFromValue, MultiTypeInputType, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { MultiTypeExecutionCondition } from '@common/components/MultiTypeExecutionCondition/MultiTypeExecutionCondition'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { MultiTypeMap } from '@common/components/MultiTypeMap/MultiTypeMap'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { AwsSamDeployStepInitialValues } from '@pipeline/utils/types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface AwsSamDeployStepOptionalFieldsProps {
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
  readonly?: boolean
  formik: FormikProps<AwsSamDeployStepInitialValues>
}

export function AwsSamDeployStepOptionalFields(props: AwsSamDeployStepOptionalFieldsProps): React.ReactElement {
  const { readonly, allowableTypes, formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <>
        <Text
          font={{ variation: FontVariation.FORM_LABEL, weight: 'semi-bold', size: 'normal' }}
          tooltipProps={{ dataTooltipId: 'awsSamDeployCommandOptions' }}
        >
          {getString('optionalField', { name: getString('cd.steps.awsSamDeployStep.awsSamDeployCommandOptions') })}
        </Text>
        <Container className={stepCss.formGroup}>
          <Container padding={{ top: 'small', bottom: 'small' }}>
            <MultiTypeExecutionCondition
              path={'spec.deployCommandOptions'}
              allowableTypes={allowableTypes}
              isInputDisabled={readonly}
              expressions={expressions}
            />
          </Container>
        </Container>
      </>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.stackName"
          label={getString('optionalField', { name: 'cd.cloudFormation.stackName' })}
          placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.stackName) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.stackName as string}
            type="String"
            variableName="spec.stackName"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.stackName', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={cx(stepCss.formGroup, stepCss.md)}>
        <FormMultiTypeCheckboxField
          name={'spec.privileged'}
          label={getString('optionalField', { name: getString('pipeline.buildInfra.privileged') })}
          multiTypeTextbox={{
            expressions,
            allowableTypes,
            disabled: readonly
          }}
          tooltipProps={{ dataTooltipId: 'privileged' }}
          disabled={readonly}
          configureOptionsProps={{ hideExecutionTimeField: true }}
        />
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTypeInput
          name="spec.imagePullPolicy"
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
        />
        {getMultiTypeFromValue(formik.values.spec.imagePullPolicy) === MultiTypeInputType.RUNTIME && (
          <SelectConfigureOptions
            options={getImagePullPolicyOptions(getString)}
            value={formik.values.spec.imagePullPolicy as string}
            type={getString('string')}
            variableName={'spec.imagePullPolicy'}
            showRequiredField={false}
            showDefaultField={false}
            onChange={val => formik?.setFieldValue('formik.values.spec.imagePullPolicy', val)}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.runAsUser"
          label={getString('optionalField', { name: getString('pipeline.stepCommonFields.runAsUser') })}
          placeholder="1000"
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.runAsUser) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.runAsUser as string}
            type="String"
            variableName="spec.runAsUser"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.runAsUser', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.resources.limits.memory"
          label={getString('optionalField', { name: getString('pipelineSteps.limitMemoryLabel') })}
          placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitMemoryLabel') })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.resources?.limits?.memory) === MultiTypeInputType.RUNTIME &&
          !readonly && (
            <ConfigureOptions
              value={formik.values.spec?.resources?.limits?.memory as string}
              type="String"
              variableName="spec.resources.limits.memory"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formik.setFieldValue('spec.resources.limits.memory', value)
              }}
              isReadonly={readonly}
            />
          )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.resources.limits.cpu"
          label={getString('optionalField', { name: getString('pipelineSteps.limitCPULabel') })}
          placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitCPULabel') })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.resources?.limits?.cpu) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.resources?.limits?.cpu as string}
            type="String"
            variableName="spec.resources.limits.cpu"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.resources.limits.cpu', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <MultiTypeMap
          appearance={'minimal'}
          name={'spec.envVariables'}
          valueMultiTextInputProps={{ expressions, allowableTypes }}
          multiTypeFieldSelectorProps={{
            label: getString('optionalField', { name: getString('environmentVariables') }),
            disableTypeSelection: true
          }}
          configureOptionsProps={{
            hideExecutionTimeField: true
          }}
          disabled={readonly}
        />
      </Container>
    </>
  )
}
