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
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
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
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './DockerHubStepFunctionConfigs'
import type { DockerHubStepProps, DockerHubStepData, DockerHubStepDataUI } from './DockerHubStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const DockerHubStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: DockerHubStepProps,
  formikRef: StepFormikFowardRef<DockerHubStepData>
): JSX.Element => {
  const { CI_ENABLE_DLC } = useFeatureFlags()
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
  // const values = getInitialValuesInCorrectFormat<DockerHubStepData, DockerHubStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  const buildInfrastructureType =
    (get(currentStage, 'stage.spec.infrastructure.type') as CIBuildInfrastructureType) ||
    (get(currentStage, 'stage.spec.runtime.type') as CIBuildInfrastructureType)

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<DockerHubStepData, DockerHubStepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="dockerHubStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<DockerHubStepDataUI, DockerHubStepData>(
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
      onSubmit={(_values: DockerHubStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<DockerHubStepDataUI, DockerHubStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<DockerHubStepData>) => {
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
                  label: { labelKey: 'pipelineSteps.dockerHubConnectorLabel' },
                  type: Connectors.DOCKER
                },
                'spec.repo': {},
                'spec.tags': {},
                ...(CI_ENABLE_DLC &&
                  buildInfrastructureType === CIBuildInfrastructureType.Cloud && { 'spec.caching': {} })
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
                        'spec.remoteCacheRepo': {
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

export const DockerHubStepBaseWithRef = React.forwardRef(DockerHubStepBase)
