/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormInput, FormikForm, MultiTypeInputType, Accordion, Container, Text } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { get, isEmpty, set } from 'lodash-es'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings, UseStringsReturn } from 'framework/strings'
import StepCommonFields, {
  GetImagePullPolicyOptions
} from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import { getConnectorRefWidth, isRuntimeInput, CodebaseTypes } from '@pipeline/utils/CIUtils'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  getBuildTypeLabels,
  getBuildTypeInputLabels,
  CodeBaseType
} from '@pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import {
  runtimeInputGearWidth,
  CodebaseRuntimeInputsInterface
} from '@pipeline/components/PipelineStudio/RightBar/RightBarUtils'
import { FormMultiTypeRadioGroupField } from '@common/components/MultiTypeRadioGroup/MultiTypeRadioGroup'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { transformValuesFieldsConfig, getEditViewValidateFieldsConfig } from './GitCloneStepFunctionConfigs'
import type { GitCloneStepProps, GitCloneStepData, GitCloneStepDataUI } from './GitCloneStep'
import { CIStep } from '../CIStep/CIStep'
import { useGetPropagatedStageById } from '../CIStep/StepUtils'
import type { CIBuildInfrastructureType } from '../../../constants/Constants'
import { renderBuildTypeInputField, renderBuild } from './GitCloneStepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

// const renderBuildTypeInputField = ({
//   type,
//   inputLabels,
//   readonly,
//   expressions,
//   allowableTypes,
//   prefix
// }: {
//   type: CodeBaseType
//   inputLabels: Record<string, string>
//   allowableTypes: MultiTypeInputType[]
//   readonly?: boolean
//   expressions?: string[]
//   prefix?: string
// }): JSX.Element => {
//   return (
//     <FormInput.MultiTextInput
//       label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{inputLabels[type]}</Text>}
//       name={`${prefix}spec.build.spec.${type}`}
//       multiTextInputProps={{
//         expressions,
//         allowableTypes
//       }}
//       disabled={readonly}
//       className={css.bottomMargin1}
//     />
//   )
// }

// export const renderBuild = ({
//   expressions,
//   readonly,
//   getString,
//   formik,
//   allowableTypes,
//   path
// }: {
//   expressions: string[]
//   getString: UseStringsReturn['getString']
//   formik: any
//   allowableTypes: MultiTypeInputType[]
//   connectorType?: ConnectorInfoDTO['type']
//   readonly?: boolean
//   path?: string
// }) => {
//   const radioLabels = getBuildTypeLabels(getString)
//   const inputLabels = getBuildTypeInputLabels(getString)
//   const prefix = isEmpty(path) ? '' : `${path}.`
//   const buildTypeValue = get(formik?.values, `${prefix}spec.build.type`)
//   // either can be true onEdit or onChange before Saving
//   const isBuildRuntimeInput =
//     isRuntimeInput(get(formik?.values, `${prefix}spec.build`)) || isRuntimeInput(buildTypeValue)

//   const handleTypeChange = (newType: any = CodebaseTypes.branch): void => {
//     const newValuesSpec = get(formik.values, `${prefix}spec`)
//     if (isRuntimeInput(newType)) {
//       newValuesSpec.build = newType
//     } else {
//       newValuesSpec.build = { type: newType }
//     }
//     if (newValuesSpec.build?.spec) {
//       delete newValuesSpec.build.spec.branch
//       delete newValuesSpec.build.spec.tag
//     }
//     const newValues = set(formik.values, `${prefix}spec`, newValuesSpec)
//     formik?.setValues({ ...newValues })
//   }

//   return (
//     <Container>
//       <FormMultiTypeRadioGroupField
//         name={`${prefix}spec.build.type`}
//         label={getString('filters.executions.buildType')}
//         options={[
//           { label: radioLabels['branch'], value: CodebaseTypes.branch },
//           { label: radioLabels['tag'], value: CodebaseTypes.tag }
//         ]}
//         onChange={handleTypeChange}
//         className={cx(css.radioGroup, isBuildRuntimeInput && css.bottomMargin0)}
//         tooltipProps={{
//           dataTooltipId: 'buildType'
//         }}
//         multiTypeRadioGroup={{
//           name: `${prefix}spec.build.type`,
//           expressions,
//           disabled: readonly,
//           allowableTypes: allowableTypes.filter(type => type !== MultiTypeInputType.EXPRESSION)
//         }}
//       />
//       {buildTypeValue === CodebaseTypes.branch
//         ? renderBuildTypeInputField({ inputLabels, type: buildTypeValue, readonly, allowableTypes, prefix })
//         : null}
//       {buildTypeValue === CodebaseTypes.tag
//         ? renderBuildTypeInputField({ inputLabels, type: buildTypeValue, readonly, allowableTypes, prefix })
//         : null}
//     </Container>
//   )
// }

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
