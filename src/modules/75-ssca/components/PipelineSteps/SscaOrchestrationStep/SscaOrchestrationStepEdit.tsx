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
import { useParams } from 'react-router-dom'
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
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import { useGitScope } from '@pipeline/utils/CIUtils'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import type { SbomOrchestrationTool, SbomSource, SyftSbomOrchestration } from 'services/ci'
import { AllMultiTypeInputTypesForStep } from '../utils'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './SscaOrchestrationStepFunctionConfigs'
import type {
  SscaOrchestrationStepData,
  SscaOrchestrationStepDataUI,
  SscaOrchestrationStepProps
} from './SscaOrchestrationStep'
import css from './SscaOrchestrationStep.module.scss'

const getTypedOptions = <T extends string>(input: T[]): SelectOption[] => {
  return input.map(item => ({ label: item, value: item }))
}

const artifactTypeOptions = getTypedOptions<SbomSource['type']>(['image'])
const sbomGenerationToolOptions = getTypedOptions<SbomOrchestrationTool['type']>(['Syft'])
const syftSbomFormats: { label: string; value: NonNullable<SyftSbomOrchestration['format']> }[] = [
  { label: 'SPDX', value: 'spdx-json' }
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
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const gitScope = useGitScope()

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

              <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} color={Color.GREY_900}>
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
                items={syftSbomFormats}
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

              <FormMultiTypeConnectorField
                label={getString('pipelineSteps.connectorLabel')}
                type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER, Connectors.AZURE]}
                name={`spec.source.spec.connectorRef`}
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                multiTypeProps={{
                  expressions,
                  allowableTypes: AllMultiTypeInputTypesForStep,
                  disabled: readonly
                }}
                gitScope={gitScope}
                setRefValue
                configureOptionsProps={{
                  hideExecutionTimeField: true
                }}
              />

              <MultiTypeTextField
                name={`spec.source.spec.image`}
                label={
                  <Text
                    className={css.formLabel}
                    tooltipProps={{ dataTooltipId: 'image' }}
                    placeholder={getString('imagePlaceholder')}
                  >
                    {getString('image')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  multiTextInputProps: {
                    allowableTypes: AllMultiTypeInputTypesForStep
                  }
                }}
                configureOptionsProps={{
                  hideExecutionTimeField: true
                }}
              />

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.orchestrationStep.sbomAttestation')}
              </Text>

              <MultiTypeSecretInput
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
