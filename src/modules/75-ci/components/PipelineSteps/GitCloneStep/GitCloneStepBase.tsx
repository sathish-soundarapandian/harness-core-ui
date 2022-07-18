/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm, Accordion, Container } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { get } from 'lodash-es'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import StepCommonFields, {
  GetImagePullPolicyOptions
} from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import { getConnectorRefWidth, isRuntimeInput } from '@pipeline/utils/CIUtils'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  runtimeInputGearWidth,
  CodebaseRuntimeInputsInterface
} from '@pipeline/components/PipelineStudio/RightBar/RightBarUtils'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { transformValuesFieldsConfig, getEditViewValidateFieldsConfig } from './GitCloneStepFunctionConfigs'
import type { GitCloneStepProps, GitCloneStepData, GitCloneStepDataUI } from './GitCloneStep'
import { CIStep } from '../CIStep/CIStep'
import { useGetPropagatedStageById } from '../CIStep/StepUtils'
import type { CIBuildInfrastructureType } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const GitCloneStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: GitCloneStepProps,
  formikRef: StepFormikFowardRef<GitCloneStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    isReadonly
  } = usePipelineContext()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType: CIBuildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type')
  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')
  const codebaseConnector = initialValues?.spec?.connectorRef
  const [codebaseRuntimeInputs, setCodebaseRuntimeInputs] = React.useState<CodebaseRuntimeInputsInterface>({
    ...(isRuntimeInput(codebaseConnector) && { connectorRef: true, repoName: true })
  })
  // const codeBaseTypePath = `spec.build.type`
  // const [codeBaseType, setCodeBaseType] = React.useState<CodeBaseType | string | undefined>(
  //   get(formikRef?.current?.values, codeBaseTypePath)
  // )

  // React.useEffect(() => {
  //   if (formikRef?.current?.values?.spec?.connectorRef === RUNTIME_INPUT_VALUE) {
  //     const newValuesSpec = { ...formikRef?.current?.values?.spec }
  //     newValuesSpec.repoName = RUNTIME_INPUT_VALUE
  //     formikRef?.current?.setValues({ ...formikRef?.current?.values, spec: newValuesSpec })
  //     setCodeBaseType(undefined)
  //   }
  // }, [formikRef?.current?.values?.spec?.connectorRef])
  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<GitCloneStepData, GitCloneStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions() }
      )}
      formName="GitCloneStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<GitCloneStepDataUI, GitCloneStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          getEditViewValidateFieldsConfig(
            !isRuntimeInput(valuesToValidate?.spec?.connectorRef) && !isRuntimeInput(valuesToValidate?.spec?.build)
          ),
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: GitCloneStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<GitCloneStepDataUI, GitCloneStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<GitCloneStepData>) => {
        setFormikRef?.(formikRef, formik)
        const connectorWidth = getConnectorRefWidth('DefaultView')
        const connectorRefValue = formik.values.spec?.connectorRef
        const isConnectorRuntimeInput = isRuntimeInput(connectorRefValue)
        // const codeBaseTypePath = `spec.build.type`
        // const [codeBaseType, setCodeBaseType] = React.useState<CodeBaseType | string | undefined>(
        //   get(formik?.values, codeBaseTypePath)
        // )
        // React.useEffect(() => {
        //   if (formik?.values?.spec?.connectorRef === RUNTIME_INPUT_VALUE) {
        //     const newValuesSpec = { ...formik?.values?.spec }
        //     newValuesSpec.repoName = RUNTIME_INPUT_VALUE
        //     formik?.setValues({ ...formik?.values, spec: newValuesSpec })
        //     setCodeBaseType(undefined)
        //   }
        // }, [formik?.values?.spec?.connectorRef])
        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
              enableFields={{
                name: {},
                description: {},
                ['spec.connectorAndRepo']: {
                  connectorUrl,
                  connectionType,
                  connectorWidth: isConnectorRuntimeInput ? connectorWidth - runtimeInputGearWidth : connectorWidth,
                  setConnectionType,
                  setConnectorUrl,
                  repoIdentifier,
                  branch,
                  isReadonly,
                  setCodebaseRuntimeInputs,
                  codebaseRuntimeInputs
                },
                ['spec.build']: {},
                ['spec.cloneDirectory']: { tooltipId: 'cloneDirectory' }
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
                        'spec.depth': {},
                        'spec.sslVerify': {}
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

export const GitCloneStepBaseWithRef = React.forwardRef(GitCloneStepBase)
