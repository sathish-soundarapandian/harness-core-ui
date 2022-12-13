/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm, Accordion, Container } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { get } from 'lodash-es'
import { Connectors } from '@connectors/constants'
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
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './SSCAEnforceStepFunctionConfigs'
import type { SSCAEnforceStepProps, SSCAEnforceStepData, SSCAEnforceStepDataUI } from './SSCAEnforceStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { AllMultiTypeInputTypesForStep, useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SSCAEnforceStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: SSCAEnforceStepProps,
  formikRef: StepFormikFowardRef<SSCAEnforceStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType: CIBuildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type')

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<SSCAEnforceStepData, SSCAEnforceStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
      )}
      formName="SSCAEnforceStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<SSCAEnforceStepDataUI, SSCAEnforceStepData>(
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
      onSubmit={(_values: SSCAEnforceStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<SSCAEnforceStepDataUI, SSCAEnforceStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<SSCAEnforceStepData>) => {
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
                'spec.generationType': {},
                'spec.artifactType': {},
                'spec.source': {},
                'spec.sbomGenerationTool': {},
                'spec.sbomFormat': {}
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
                        'spec.signed': {}
                      }}
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

export const SSCAEnforceStepBaseWithRef = React.forwardRef(SSCAEnforceStepBase)
