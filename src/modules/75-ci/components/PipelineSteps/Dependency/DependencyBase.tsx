/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm, Accordion, Container } from '@wings-software/uicore'
import get from 'lodash/get'
import type { K8sDirectInfraYaml } from 'services/ci'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import StepCommonFields, {
  GetImagePullPolicyOptions
} from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './DependencyFunctionConfigs'
import type { DependencyProps, DependencyData, DependencyDataUI } from './Dependency'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { AllMultiTypeInputTypesForStep, useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const DependencyBase = (
  { initialValues, onUpdate, isNewStep, readonly, stepViewType, onChange }: DependencyProps,
  formikRef: StepFormikFowardRef<DependencyData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type') as K8sDirectInfraYaml['type']

  return (
    <Formik<DependencyDataUI>
      initialValues={getInitialValuesInCorrectFormat<DependencyData, DependencyDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions() }
      )}
      formName="dependencyBase"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<DependencyDataUI, DependencyData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig,
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || [],
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || [],
            type: StepType.Dependency,
            getString
          },
          stepViewType,
          buildInfrastructureType
        )
      }}
      onSubmit={(_values: DependencyDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<DependencyDataUI, DependencyData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {formik => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <div style={{ padding: 'var(--spacing-large)' }}>
              <CIStep
                isNewStep={isNewStep}
                readonly={readonly}
                stepLabel={getString('dependencyNameLabel')}
                stepViewType={stepViewType}
                formik={formik}
                enableFields={{
                  name: {},
                  description: {},
                  'spec.connectorRef': {
                    label: { labelKey: 'pipelineSteps.connectorLabel', tooltipId: 'dependencyConnector' },
                    type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER]
                  },
                  'spec.image': {
                    tooltipId: 'image',
                    multiTextInputProps: {
                      placeholder: getString('dependencyImagePlaceholder'),
                      disabled: readonly,
                      multiTextInputProps: {
                        expressions,
                        textProps: {
                          autoComplete: 'off'
                        },
                        allowableTypes: AllMultiTypeInputTypesForStep
                      }
                    }
                  }
                }}
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
                          'spec.privileged': {},
                          'spec.envVariables': { tooltipId: 'dependencyEnvironmentVariables' },
                          'spec.entrypoint': {},
                          'spec.args': {},
                          ...(buildInfrastructureType === 'VM' && {
                            'spec.portBindings': {}
                          })
                        }}
                      />
                      <StepCommonFields
                        enableFields={['spec.imagePullPolicy']}
                        withoutTimeout
                        disabled={readonly}
                        buildInfrastructureType={buildInfrastructureType}
                      />
                    </Container>
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

export const DependencyBaseWithRef = React.forwardRef(DependencyBase)
