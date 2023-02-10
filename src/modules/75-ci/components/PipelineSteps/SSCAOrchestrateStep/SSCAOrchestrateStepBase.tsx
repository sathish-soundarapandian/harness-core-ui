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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './SSCAOrchestrateStepFunctionConfigs'
import type {
  SSCAOrchestrateStepProps,
  SSCAOrchestrateStepData,
  SSCAOrchestrateStepDataUI
} from './SSCAOrchestrateStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { AllMultiTypeInputTypesForStep, useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SSCAOrchestrateStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: SSCAOrchestrateStepProps,
  formikRef: StepFormikFowardRef<SSCAOrchestrateStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<SSCAOrchestrateStepData, SSCAOrchestrateStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
      )}
      formName="SSCAOrchestrateStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<SSCAOrchestrateStepDataUI, SSCAOrchestrateStepData>(
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
      onSubmit={(_values: SSCAOrchestrateStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<SSCAOrchestrateStepDataUI, SSCAOrchestrateStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<SSCAOrchestrateStepData>) => {
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
                'spec.step.type': {},
                'spec.sbom.tool': {},
                'spec.sbom.format': {},
                'spec.sbomTarget.type': {},
                'spec.attestation.type': {},
                'spec.attestation.tool': {}
              }}
              formik={formik}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const SSCAOrchestrateStepBaseWithRef = React.forwardRef(SSCAOrchestrateStepBase)
