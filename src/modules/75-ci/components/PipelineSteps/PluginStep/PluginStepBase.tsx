/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm, Accordion, Container } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { Connectors } from '@connectors/constants'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import StepCommonFields from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './PluginStepFunctionConfigs'
import type { PluginStepProps, PluginStepData, PluginStepDataUI } from './PluginStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { AllMultiTypeInputTypesForStep, useGetPropagatedStageById } from '../CIStep/StepUtils'
import { getCIStageInfraType } from '../../../utils/CIPipelineStudioUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const PluginStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: PluginStepProps,
  formikRef: StepFormikFowardRef<PluginStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType = getCIStageInfraType(currentStage)

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<PluginStepData, PluginStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
      )}
      formName="pluginStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<PluginStepDataUI, PluginStepData>(
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
      onSubmit={(_values: PluginStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<PluginStepDataUI, PluginStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<PluginStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
              enableFields={{
                name: {},
                description: {},
                'spec.connectorRef': {
                  label: { labelKey: 'pipelineSteps.connectorLabel' },
                  type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER]
                },
                'spec.image': {
                  tooltipId: 'pluginImageInfo',
                  multiTextInputProps: {
                    placeholder: getString('pluginImagePlaceholder'),
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
                        'spec.privileged': {
                          shouldHide: [
                            CIBuildInfrastructureType.Cloud,
                            CIBuildInfrastructureType.VM,
                            CIBuildInfrastructureType.KubernetesHosted,
                            CIBuildInfrastructureType.Docker
                          ].includes(buildInfrastructureType)
                        },
                        'spec.settings': {},
                        'spec.reportPaths': {},
                        'spec.entrypoint': {}
                      }}
                    />
                    <StepCommonFields
                      enableFields={['spec.imagePullPolicy']}
                      disabled={readonly}
                      buildInfrastructureType={buildInfrastructureType}
                      stepViewType={stepViewType}
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

export const PluginStepBaseWithRef = React.forwardRef(PluginStepBase)
