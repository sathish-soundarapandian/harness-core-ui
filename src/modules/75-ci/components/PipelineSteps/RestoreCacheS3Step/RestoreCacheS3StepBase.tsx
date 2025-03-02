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

import StepCommonFields from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import { ArchiveFormatOptions } from '@ci/constants/Constants'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './RestoreCacheS3StepFunctionConfigs'
import type { RestoreCacheS3StepData, RestoreCacheS3StepDataUI, RestoreCacheS3StepProps } from './RestoreCacheS3Step'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RestoreCacheS3StepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: RestoreCacheS3StepProps,
  formikRef: StepFormikFowardRef<RestoreCacheS3StepData>
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

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RestoreCacheS3StepData, RestoreCacheS3StepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { archiveFormatOptions: ArchiveFormatOptions }
      )}
      formName="restoreCacheS3"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<RestoreCacheS3StepDataUI, RestoreCacheS3StepData>(
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
      onSubmit={(_values: RestoreCacheS3StepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RestoreCacheS3StepDataUI, RestoreCacheS3StepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RestoreCacheS3StepData>) => {
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
                'spec.connectorRef': {
                  label: { labelKey: 'pipelineSteps.awsConnectorLabel' },
                  type: Connectors.AWS
                },
                'spec.region': {},
                'spec.bucket': { tooltipId: 's3Bucket' },
                'spec.key': { tooltipId: 'restoreCacheKey' }
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
                      enableFields={{
                        'spec.endpoint': {},
                        'spec.archiveFormat': {},
                        'spec.pathStyle': {},
                        'spec.failIfKeyNotFound': {}
                      }}
                      readonly={readonly}
                    />
                    <StepCommonFields disabled={readonly} buildInfrastructureType={buildInfrastructureType} />
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

export const RestoreCacheS3StepBaseWithRef = React.forwardRef(RestoreCacheS3StepBase)
