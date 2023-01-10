/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm, Accordion, Container } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { get } from 'lodash-es'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import StepCommonFields, {
  GetImagePullPolicyOptions
} from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './BitrisePluginStepFunctionConfigs'
import type { BitrisePluginStepProps, BitrisePluginStepData, BitrisePluginStepDataUI } from './BitrisePluginStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { AllMultiTypeInputTypesForStep, useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const BitrisePluginStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: BitrisePluginStepProps,
  formikRef: StepFormikFowardRef<BitrisePluginStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType: CIBuildInfrastructureType =
    get(currentStage, 'stage.spec.infrastructure.type') || get(currentStage, 'stage.spec.runtime.type')

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<BitrisePluginStepData, BitrisePluginStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions() }
      )}
      formName="bitrisePluginStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<BitrisePluginStepDataUI, BitrisePluginStepData>(
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
      onSubmit={(_values: BitrisePluginStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<BitrisePluginStepDataUI, BitrisePluginStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<BitrisePluginStepData>) => {
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
              enableFields={{
                name: {
                  tooltipId: 'bitrisePluginStep_name'
                },
                description: {},
                'spec.uses': {
                  tooltipId: 'pluginUsesInfo',
                  multiTextInputProps: {
                    placeholder: getString('ci.bitrisePluginUsesPlaceholder'),
                    multiTextInputProps: { expressions, allowableTypes: AllMultiTypeInputTypesForStep },
                    disabled: readonly
                  }
                }
              }}
              formik={formik}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    <CIStepOptionalConfig
                      stepViewType={stepViewType}
                      readonly={readonly}
                      enableFields={{
                        'spec.with': {
                          tooltipId: 'pluginStep_with',
                          placeholder: [
                            getString('ci.bitrisePluginWithKeyPlaceholder'),
                            getString('ci.bitrisePluginWithValuePlaceholder')
                          ]
                        },
                        'spec.env': {
                          tooltipId: 'pluginStep_env',
                          placeholder: [
                            getString('ci.pluginEnvKeyPlaceholder'),
                            getString('ci.pluginEnvValuePlaceholder')
                          ]
                        }
                      }}
                    />
                    <StepCommonFields
                      disabled={readonly}
                      buildInfrastructureType={buildInfrastructureType}
                      disableRunAsUser
                    />
                  </Container>
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const BitrisePluginStepBaseWithRef = React.forwardRef(BitrisePluginStepBase)
