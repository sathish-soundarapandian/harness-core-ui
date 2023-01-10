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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './GHAPluginStepFunctionConfigs'
import type { GHAPluginStepProps, GHAPluginStepData, GHAPluginStepDataUI } from './GHAPluginStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { AllMultiTypeInputTypesForStep, useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const GHAPluginStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: GHAPluginStepProps,
  formikRef: StepFormikFowardRef<GHAPluginStepData>
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
      initialValues={getInitialValuesInCorrectFormat<GHAPluginStepData, GHAPluginStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions() }
      )}
      formName="GHApluginStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<GHAPluginStepDataUI, GHAPluginStepData>(
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
      onSubmit={(_values: GHAPluginStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<GHAPluginStepDataUI, GHAPluginStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<GHAPluginStepData>) => {
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
              enableFields={{
                name: {
                  tooltipId: 'GHApluginStep_name'
                },
                description: {},
                'spec.uses': {
                  tooltipId: 'pluginUsesInfo',
                  multiTextInputProps: {
                    placeholder: getString('ci.GHAPluginUsesPlaceholder'),
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
                            getString('ci.GHAPluginWithKeyPlaceholder'),
                            getString('ci.getStartedWithCI.carousel.labels.harnessCIFeatures')
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

export const GHAPluginStepBaseWithRef = React.forwardRef(GHAPluginStepBase)
