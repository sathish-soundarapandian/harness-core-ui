/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Divider } from '@blueprintjs/core'
import { Accordion, Container, Formik, FormikForm } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { get } from 'lodash-es'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import StepCommonFields from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CIStep } from '@ci/components/PipelineSteps/CIStep/CIStep'
import { useGetPropagatedStageById } from '@ci/components/PipelineSteps/CIStep/StepUtils'
import type { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import { CIStepOptionalConfig } from '@ci/components/PipelineSteps/CIStep/CIStepOptionalConfig'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './BanditStepFunctionConfigs'
import type { BanditStepProps, BanditStepData } from './BanditStep'
import {
  SecurityAdvancedFields,
  SecurityIngestionFields,
  SecurityScanFields,
  SecurityTargetFields
} from '../SecurityFields'
import { dividerBottomMargin } from '../constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const BanditStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, allowableTypes, onChange }: BanditStepProps,
  formikRef: StepFormikFowardRef<BanditStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType =
    (get(currentStage, 'stage.spec.infrastructure.type') as CIBuildInfrastructureType) ||
    (get(currentStage, 'stage.spec.runtime.type') as CIBuildInfrastructureType)

  const valuesInCorrectFormat = getInitialValuesInCorrectFormat<BanditStepData, BanditStepData>(
    initialValues,
    transformValuesFieldsConfig(initialValues),
    { imagePullPolicyOptions: getImagePullPolicyOptions(getString) }
  )

  return (
    <Formik
      initialValues={valuesInCorrectFormat}
      formName="BanditStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<BanditStepData, BanditStepData>(
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
      onSubmit={(_values: BanditStepData) => {
        const schemaValues = getFormValuesInCorrectFormat<BanditStepData, BanditStepData>(
          _values,
          transformValuesFieldsConfig(_values)
        )

        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<BanditStepData>) => {
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

            <Divider style={{ marginBottom: dividerBottomMargin }} />

            <SecurityScanFields<BanditStepData>
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
              scanConfigReadonly
              scanModeSelectItems={[
                {
                  value: 'orchestration',
                  label: 'Orchestration'
                },
                {
                  value: 'extraction',
                  label: 'Extraction'
                },
                {
                  value: 'ingestion',
                  label: 'Ingestion'
                }
              ]}
            />

            <Divider style={{ marginBottom: dividerBottomMargin }} />

            <SecurityTargetFields<BanditStepData>
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
              targetTypeSelectItems={[
                {
                  label: 'Repository',
                  value: 'repository'
                }
              ]}
            />

            <SecurityIngestionFields<BanditStepData>
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
            />

            <Divider style={{ marginBottom: dividerBottomMargin }} />

            <SecurityAdvancedFields<BanditStepData>
              allowableTypes={allowableTypes}
              formik={formik}
              stepViewType={stepViewType}
            />

            <Divider style={{ marginBottom: dividerBottomMargin }} />

            <CIStepOptionalConfig
              stepViewType={stepViewType}
              enableFields={{
                'spec.settings': {}
              }}
              allowableTypes={allowableTypes}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    <StepCommonFields
                      enableFields={['spec.imagePullPolicy']}
                      disabled={readonly}
                      allowableTypes={allowableTypes}
                      buildInfrastructureType={buildInfrastructureType}
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

export const BanditStepBaseWithRef = React.forwardRef(BanditStepBase)
