/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import { Divider } from '@blueprintjs/core'
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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './BlackduckStepFunctionConfigs'
import type { BlackduckStepProps, BlackduckStepData } from './BlackduckStep'
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
  REPOSITORY_TARGET_TYPE,
  tooltipIds
} from '../constants'
import SecurityField from '../SecurityField'

export const BlackduckStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, allowableTypes, onChange }: BlackduckStepProps,
  formikRef: StepFormikFowardRef<BlackduckStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const valuesInCorrectFormat = getInitialValuesInCorrectFormat<BlackduckStepData, BlackduckStepData>(
    initialValues,
    transformValuesFieldsConfig(initialValues),
    { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
  )

  return (
    <Formik
      initialValues={valuesInCorrectFormat}
      formName="BlackduckStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<BlackduckStepData, BlackduckStepData>(
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
      onSubmit={(_values: BlackduckStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<BlackduckStepData, BlackduckStepData>(
          _values,
          transformValuesFieldsConfig(_values)
        )

        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<BlackduckStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        const targetTypeSelectItems = [REPOSITORY_TARGET_TYPE, CONTAINER_TARGET_TYPE]

        if (targetTypeSelectItems.length === 1 && formik.values.spec.target.type !== 'repository') {
          formik.setFieldValue('spec.target.type', 'repository')
        }

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
              scanModeSelectItems={[ORCHESTRATION_SCAN_MODE, EXTRACTION_SCAN_MODE, INGESTION_SCAN_MODE]}
            />

            <SecurityTargetFields
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
              targetTypeSelectItems={targetTypeSelectItems}
            />

            <SecurityImageFields allowableTypes={allowableTypes} formik={formik} stepViewType={stepViewType} />

            <SecurityIngestionFields allowableTypes={allowableTypes} formik={formik} stepViewType={stepViewType} />

            <SecurityAuthFields
              showFields={{
                ssl: true,
                domain: true,
                access_id: true,
                type: true,
                version: true
              }}
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
            />

            {formik.values.spec.mode !== INGESTION_SCAN_MODE.value && (
              <>
                <SecurityField
                  stepViewType={stepViewType}
                  allowableTypes={allowableTypes}
                  formik={formik}
                  enableFields={{
                    header: {
                      label: 'sto.stepField.tool.fieldsHeading'
                    },
                    'spec.tool.project_name': {
                      label: 'projectCard.projectName',
                      optional: false,
                      tooltipId: tooltipIds.toolProjectName
                    },
                    'spec.tool.project_version': {
                      label: 'sto.stepField.tool.projectVersion',
                      optional: false,
                      tooltipId: tooltipIds.toolProjectVersion
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

export const BlackduckStepBaseWithRef = React.forwardRef(BlackduckStepBase)
