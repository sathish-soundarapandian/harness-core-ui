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

import StepCommonFields /*,{ /*usePullOptions }*/ from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './GCRStepFunctionConfigs'
import type { GCRStepProps, GCRStepData, GCRStepDataUI } from './GCRStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const GCRStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: GCRStepProps,
  formikRef: StepFormikFowardRef<GCRStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<GCRStepData, GCRStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  const buildInfrastructureType =
    (get(currentStage, 'stage.spec.infrastructure.type') as CIBuildInfrastructureType) ||
    (get(currentStage, 'stage.spec.runtime.type') as CIBuildInfrastructureType)

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<GCRStepData, GCRStepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="ciGcrStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<GCRStepDataUI, GCRStepData>(
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
      onSubmit={(_values: GCRStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<GCRStepDataUI, GCRStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<GCRStepData>) => {
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
                'spec.imageName': {},
                'spec.connectorRef': {
                  label: { labelKey: 'pipelineSteps.gcpConnectorLabel' },
                  type: Connectors.GCP
                },
                'spec.host': {},
                'spec.projectID': {},
                'spec.tags': {}
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
                        'spec.optimize': {
                          shouldHide: [
                            CIBuildInfrastructureType.VM,
                            CIBuildInfrastructureType.Cloud,
                            CIBuildInfrastructureType.Docker
                          ].includes(buildInfrastructureType)
                        },
                        'spec.dockerfile': {},
                        'spec.context': {},
                        'spec.labels': {},
                        'spec.buildArgs': {},
                        'spec.target': { tooltipId: 'target' },
                        'spec.remoteCacheImage': {
                          shouldHide: [
                            CIBuildInfrastructureType.VM,
                            CIBuildInfrastructureType.Cloud,
                            CIBuildInfrastructureType.Docker
                          ].includes(buildInfrastructureType)
                        }
                      }}
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

export const GCRStepBaseWithRef = React.forwardRef(GCRStepBase)
