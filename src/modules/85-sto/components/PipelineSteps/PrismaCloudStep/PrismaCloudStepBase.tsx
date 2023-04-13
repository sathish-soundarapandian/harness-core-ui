/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { Divider } from '@blueprintjs/core'
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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './PrismaCloudStepFunctionConfigs'
import type { PrismaCloudStepProps, PrismaCloudStepData } from './PrismaCloudStep'
import {
  AdditionalFields,
  SecurityAuthFields,
  SecurityImageFields,
  SecurityIngestionFields,
  SecurityScanFields,
  SecurityTargetFields
} from '../SecurityFields'
import {
  CONTAINER_TARGET_TYPE,
  dividerBottomMargin,
  EXTRACTION_SCAN_MODE,
  INGESTION_SCAN_MODE,
  ORCHESTRATION_SCAN_MODE,
  tooltipIds
} from '../constants'
import SecurityField from '../SecurityField'
import type { SecurityStepData, SecurityStepSpec } from '../types'

export const PrismaCloudStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, allowableTypes, onChange }: PrismaCloudStepProps,
  formikRef: StepFormikFowardRef<PrismaCloudStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const valuesInCorrectFormat = getInitialValuesInCorrectFormat<PrismaCloudStepData, PrismaCloudStepData>(
    initialValues,
    transformValuesFieldsConfig(initialValues),
    { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
  )

  return (
    <Formik
      initialValues={valuesInCorrectFormat}
      formName="PrismaCloudStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<PrismaCloudStepData, PrismaCloudStepData>(
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
      onSubmit={(_values: PrismaCloudStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<PrismaCloudStepData, PrismaCloudStepData>(
          _values,
          transformValuesFieldsConfig(_values)
        )

        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<SecurityStepData<SecurityStepSpec>>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        if (
          formik.values.spec.privileged !== true &&
          formik.values.spec.mode === 'orchestration' &&
          formik.values.spec.target.type === 'container'
        ) {
          formik.setFieldValue('spec.privileged', true)
        } else if (
          formik.values.spec.privileged === true &&
          (formik.values.spec.mode !== 'orchestration' || formik.values.spec.target.type !== 'container')
        ) {
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
              scanConfigReadonly
              scanModeSelectItems={[ORCHESTRATION_SCAN_MODE, INGESTION_SCAN_MODE, EXTRACTION_SCAN_MODE]}
            />

            <SecurityTargetFields
              allowableTypes={allowableTypes}
              formik={formik}
              targetTypeSelectItems={[CONTAINER_TARGET_TYPE]}
            />

            <SecurityImageFields allowableTypes={allowableTypes} formik={formik} />

            <SecurityIngestionFields allowableTypes={allowableTypes} formik={formik} />

            <SecurityAuthFields
              showFields={{ access_id: true, domain: true }}
              allowableTypes={allowableTypes}
              formik={formik}
              authDomainPlaceHolder="https://us-west1.cloud.twistlock.com/us-3-123456789"
            />

            {formik.values.spec.mode === 'extraction' && (
              <>
                <SecurityField
                  allowableTypes={allowableTypes}
                  formik={formik}
                  enableFields={{
                    header: {
                      label: 'sto.stepField.tool.fieldsHeading'
                    },
                    'spec.tool.image_name': {
                      label: 'imageNameLabel',
                      tooltipId: tooltipIds.toolImageName
                    }
                  }}
                />
                <Divider style={{ marginBottom: dividerBottomMargin }} />
              </>
            )}
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

export const PrismaCloudStepBaseWithRef = React.forwardRef(PrismaCloudStepBase)
