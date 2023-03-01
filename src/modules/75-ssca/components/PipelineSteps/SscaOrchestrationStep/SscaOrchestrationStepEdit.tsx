/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Accordion, Formik, FormikForm, FormInput, SelectOption, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import React from 'react'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  getFormValuesInCorrectFormat,
  getInitialValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useStrings } from 'framework/strings'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import type {
  SscaOrchestrationStepData,
  SscaOrchestrationStepDataUI,
  SscaOrchestrationStepProps
} from './SscaOrchestrationStep'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './SscaOrchestrationStepFunctionConfigs'
import css from './SscaOrchestrationStep.module.scss'

export const artifactTypeOptions: SelectOption[] = [{ label: 'Image', value: 'image' }]

export const sbomGenerationToolOptions: SelectOption[] = [{ label: 'Syft', value: 'Syft' }]

export const sbomFormatOptions = [
  { label: 'SPDX', value: 'SPDX' },
  { label: 'CycloneDX', value: 'CycloneDX' }
]

const SscaOrchestrationStepEdit = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    onChange,
    allowableTypes
  }: SscaOrchestrationStepProps,
  formikRef: StepFormikFowardRef<SscaOrchestrationStepData>
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { getStageFromPipeline, state } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(
    state.selectionState.selectedStageId || ''
  )

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<SscaOrchestrationStepData, SscaOrchestrationStepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="SscaOrchestrationStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<SscaOrchestrationStepDataUI, SscaOrchestrationStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig,
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: SscaOrchestrationStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<SscaOrchestrationStepDataUI, SscaOrchestrationStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<SscaOrchestrationStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <div className={css.stepContainer}>
              {stepViewType !== StepViewType.Template && (
                <FormInput.InputWithIdentifier
                  inputName="name"
                  idName="identifier"
                  inputLabel={getString('pipelineSteps.stepNameLabel')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{ disabled: readonly }}
                />
              )}

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.orchestrationStep.sbomGeneration')}
              </Text>

              <FormInput.Select
                items={sbomGenerationToolOptions}
                name={`spec.tool.type`}
                label={getString('ssca.orchestrationStep.sbomTool')}
                placeholder={getString('select')}
                disabled={readonly}
              />

              <FormInput.RadioGroup
                items={sbomFormatOptions}
                name={`spec.tool.spec.format`}
                label={getString('ssca.orchestrationStep.sbomFormat')}
                disabled={readonly}
                radioGroup={{ inline: true }}
              />

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.orchestrationStep.artifactSource')}
              </Text>

              <FormInput.Select
                items={artifactTypeOptions}
                name={`spec.source.type`}
                label={getString('pipeline.artifactsSelection.artifactType')}
                placeholder={getString('select')}
                disabled={readonly}
              />

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.orchestrationStep.sbomAttestation')}
              </Text>

              <MultiTypeSecretInput
                type={'SSHKey'}
                name="spec.attestation.privateKey"
                label={getString('connectors.serviceNow.privateKey')}
                expressions={expressions}
                disabled={readonly}
              />

              <Accordion>
                <Accordion.Panel
                  id="optional-config"
                  summary={getString('common.optionalConfig')}
                  details={
                    <FormMultiTypeDurationField
                      name="timeout"
                      label={getString('pipelineSteps.timeoutLabel')}
                      multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
                      disabled={readonly}
                    />
                  }
                />
              </Accordion>
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const SscaOrchestrationStepEditWithRef = React.forwardRef(SscaOrchestrationStepEdit)
