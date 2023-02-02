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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './GrypeStepFunctionConfigs'
import type { GrypeStepProps, GrypeStepData } from './GrypeStep'
import {
  AdditionalFields,
  SecurityImageFields,
  SecurityIngestionFields,
  SecurityScanFields,
  SecurityTargetFields
} from '../SecurityFields'
import { INGESTION_SCAN_MODE, ORCHESTRATION_SCAN_MODE, CONTAINER_TARGET_TYPE } from '../constants'

export const GrypeStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, allowableTypes, onChange }: GrypeStepProps,
  formikRef: StepFormikFowardRef<GrypeStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const valuesInCorrectFormat = getInitialValuesInCorrectFormat<GrypeStepData, GrypeStepData>(
    initialValues,
    transformValuesFieldsConfig(initialValues),
    { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
  )

  return (
    <Formik
      initialValues={valuesInCorrectFormat}
      formName="GrypeStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<GrypeStepData, GrypeStepData>(
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
      onSubmit={(_values: GrypeStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<GrypeStepData, GrypeStepData>(
          _values,
          transformValuesFieldsConfig(_values)
        )

        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<GrypeStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        const targetTypeSelectItems = [CONTAINER_TARGET_TYPE]

        if (formik.values.spec.privileged !== true && formik.values.spec.mode === 'orchestration') {
          formik.setFieldValue('spec.privileged', true)
        } else if (formik.values.spec.privileged === true && formik.values.spec.mode !== 'orchestration') {
          formik.setFieldValue('spec.privileged', false)
        }

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
              stepViewType={stepViewType}
              scanConfigReadonly
              scanModeSelectItems={[ORCHESTRATION_SCAN_MODE, INGESTION_SCAN_MODE]}
            />

            <SecurityTargetFields
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
              targetTypeSelectItems={targetTypeSelectItems}
            />

            <SecurityImageFields allowableTypes={allowableTypes} formik={formik} stepViewType={stepViewType} />

            <SecurityIngestionFields allowableTypes={allowableTypes} formik={formik} stepViewType={stepViewType} />

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

export const GrypeStepBaseWithRef = React.forwardRef(GrypeStepBase)
