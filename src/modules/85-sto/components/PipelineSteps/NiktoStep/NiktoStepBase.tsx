/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import type { FormikProps } from 'formik'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CIStep } from '@ci/components/PipelineSteps/CIStep/CIStep'
import { useGetPropagatedStageById } from '@ci/components/PipelineSteps/CIStep/StepUtils'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './NiktoStepFunctionConfigs'
import type { NiktoStepProps, NiktoStepData } from './NiktoStep'
import {
  AdditionalFields,
  SecurityIngestionFields,
  SecurityInstanceFields,
  SecurityScanFields,
  SecurityTargetFields
} from '../SecurityFields'
import { INGESTION_SCAN_MODE, INSTANCE_TARGET_TYPE, NIKTO_DEFAULT_CONFIG, ORCHESTRATION_SCAN_MODE } from '../constants'

export const NiktoStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, allowableTypes, onChange }: NiktoStepProps,
  formikRef: StepFormikFowardRef<NiktoStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const valuesInCorrectFormat = getInitialValuesInCorrectFormat<NiktoStepData, NiktoStepData>(
    initialValues,
    transformValuesFieldsConfig(initialValues),
    { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
  )

  return (
    <Formik
      initialValues={valuesInCorrectFormat}
      formName="NiktoStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<NiktoStepData, NiktoStepData>(
          valuesToValidate,
          transformValuesFieldsConfig(valuesToValidate)
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig(valuesToValidate),
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: NiktoStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<NiktoStepData, NiktoStepData>(
          _values,
          transformValuesFieldsConfig(_values)
        )

        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<NiktoStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              stepViewType={stepViewType}
              allowableTypes={allowableTypes}
              enableFields={{
                name: {},
                description: {}
              }}
              formik={formik}
            />

            <SecurityScanFields
              allowableTypes={allowableTypes}
              formik={formik}
              scanModeSelectItems={[ORCHESTRATION_SCAN_MODE, INGESTION_SCAN_MODE]}
              scanConfigSelectItems={[NIKTO_DEFAULT_CONFIG]}
            />

            <SecurityTargetFields
              allowableTypes={allowableTypes}
              formik={formik}
              targetTypeSelectItems={[INSTANCE_TARGET_TYPE]}
            />

            <SecurityIngestionFields allowableTypes={allowableTypes} formik={formik} />

            <SecurityInstanceFields
              allowableTypes={allowableTypes}
              formik={formik}
              showFields={{ domain: true, protocol: true, path: true, port: true }}
            />

            <AdditionalFields
              readonly={readonly}
              currentStage={currentStage}
              stepViewType={stepViewType}
              allowableTypes={allowableTypes}
              formik={formik}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const NiktoStepBaseWithRef = React.forwardRef(NiktoStepBase)
