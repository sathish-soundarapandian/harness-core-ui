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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './AWSECRStepFunctionConfigs'
import type { AWSECRStepProps, AWSECRStepData } from './AWSECRStep'
import { AdditionalFields, SecurityAuthFields, SecurityScanFields, SecurityTargetFields } from '../SecurityFields'
import { CONTAINER_TARGET_TYPE, EXTRACTION_SCAN_MODE, tooltipIds } from '../constants'
import SecurityField from '../SecurityField'

export const AWSECRStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, allowableTypes, onChange }: AWSECRStepProps,
  formikRef: StepFormikFowardRef<AWSECRStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const valuesInCorrectFormat = getInitialValuesInCorrectFormat<AWSECRStepData, AWSECRStepData>(
    initialValues,
    transformValuesFieldsConfig(initialValues),
    { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
  )

  return (
    <Formik
      initialValues={valuesInCorrectFormat}
      formName="AWSECRStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<AWSECRStepData, AWSECRStepData>(
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
      onSubmit={(_values: AWSECRStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<AWSECRStepData, AWSECRStepData>(
          _values,
          transformValuesFieldsConfig(_values)
        )

        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<AWSECRStepData>) => {
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
              scanConfigReadonly
              scanModeSelectItems={[EXTRACTION_SCAN_MODE]}
            />

            <SecurityTargetFields
              allowableTypes={allowableTypes}
              formik={formik}
              targetTypeSelectItems={[CONTAINER_TARGET_TYPE]}
            />

            <SecurityField
              allowableTypes={allowableTypes}
              formik={formik}
              enableFields={{
                header: {
                  label: 'sto.stepField.image.fieldsHeading'
                },
                'spec.image.domain': {
                  label: 'secrets.winRmAuthFormFields.domain',
                  optional: true,
                  inputProps: { placeholder: '' },
                  tooltipId: tooltipIds.imageDomain
                }
              }}
            />

            <SecurityAuthFields
              allowableTypes={allowableTypes}
              formik={formik}
              showFields={{ access_id: true, region: true }}
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

export const AWSECRStepBaseWithRef = React.forwardRef(AWSECRStepBase)
