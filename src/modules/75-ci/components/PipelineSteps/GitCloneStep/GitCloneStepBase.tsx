/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { SetStateAction, Dispatch } from 'react'
import {
  Formik,
  FormInput,
  FormikForm,
  MultiTypeInputType,
  Accordion,
  Container,
  FormError,
  Radio,
  Text,
  Layout,
  RUNTIME_INPUT_VALUE
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { FontVariation } from '@harness/design-system'
import { get } from 'lodash-es'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import cx from 'classnames'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { useParams } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings, UseStringsReturn } from 'framework/strings'
import StepCommonFields, {
  GetImagePullPolicyOptions
} from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import { getConnectorRefWidth, isRuntimeInput, useGitScope, CodebaseTypes } from '@pipeline/utils/CIUtils'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
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
  renderConnectorAndRepoName,
  runtimeInputGearWidth,
  CodebaseRuntimeInputsInterface
} from '@pipeline/components/PipelineStudio/RightBar/RightBarUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { transformValuesFieldsConfig, getEditViewValidateFieldsConfig } from './GitCloneStepFunctionConfigs'
import type { GitCloneStepProps, GitCloneStepData, GitCloneStepDataUI } from './GitCloneStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import { AllMultiTypeInputTypesForStep, useGetPropagatedStageById } from '../CIStep/StepUtils'
import { CIBuildInfrastructureType } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const renderCodeBaseTypeInput = ({
  type,
  inputLabels,
  readonly,
  expressions
}: {
  type: CodeBaseType
  inputLabels: Record<string, string>
  readonly?: boolean
  expressions?: string[]
}): JSX.Element => {
  const newType = type === CodebaseTypes.PR ? 'number' : type
  return (
    <Container>
      <FormInput.MultiTextInput
        label={<Text font={{ variation: FontVariation.FORM_LABEL }}>{inputLabels[type]}</Text>}
        name={`spec.build.spec.${newType}`}
        multiTextInputProps={{
          expressions,
          allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
        }}
        disabled={readonly}
      />
    </Container>
  )
}

const renderBuildType = ({
  isConnectorRuntimeInput,
  expressions,
  readonly,
  getString,
  buildPath,
  codeBaseType,
  setCodeBaseType,
  formik,
  connectorType,
  width
}: {
  isConnectorRuntimeInput: boolean
  expressions: string[]
  buildPath: string
  setCodeBaseType: Dispatch<SetStateAction<CodeBaseType | undefined>>
  codeBaseType?: CodeBaseType
  getString: UseStringsReturn['getString']
  formik: any
  connectorType?: ConnectorInfoDTO['type']
  width: number
  readonly?: boolean
}) => {
  const radioLabels = getBuildTypeLabels(getString)
  const inputLabels = getBuildTypeInputLabels(getString)
  // TO delete after InputSetForm
  // const formattedPath = ''
  // const buildPath = 'spec.build'
  // const buildPath = `${formattedPath}properties.ci.codebase.build`
  // const buildSpecPath = `${formattedPath}properties.ci.codebase.build.spec`
  // const codeBaseTypePath = `spec.build.type`
  // const [codeBaseType, setCodeBaseType] = React.useState<CodeBaseType | undefined>(
  //   get(formik?.values, codeBaseTypePath)
  // )
  const buildTypeError = formik?.errors?.spec?.build?.type
  // const savedValues = React.useRef<Record<string, string>>({
  //   branch: '',
  //   tag: '',
  //   PR: ''
  // })

  // Maybe don't need
  // React.useEffect(() => {
  //   // OnEdit Case, persists saved ciCodebase build spec
  //   if (codeBaseType) {
  //     savedValues.current = Object.assign(savedValues.current, {
  //       [codeBaseType]: get(
  //         formik?.values,
  //         `${formattedPath}properties.ci.codebase.build.spec.${buildTypeInputNames[codeBaseType]}`,
  //         ''
  //       )
  //     })
  //     formik?.setFieldValue(buildSpecPath, { [buildTypeInputNames[codeBaseType]]: savedValues.current[codeBaseType] })
  //   }
  // }, [codeBaseType])

  // React.useEffect(() => {
  //   if (formik?.values?.spec?.connectorRef === RUNTIME_INPUT_VALUE) {
  //     formik?.setFieldValue(buildPath, RUNTIME_INPUT_VALUE)
  //     // set build as <+input>
  //   }
  // }, [formik?.values?.spec?.connectorRef])

  const handleTypeChange = (newType: CodeBaseType): void => {
    const newValuesSpec = formik.values.spec
    newValuesSpec.build.type = newType
    delete newValuesSpec.build.spec.branch
    delete newValuesSpec.build.spec.tag
    delete newValuesSpec.build.spec.number

    formik?.setValues({ ...formik.values, spec: newValuesSpec })
    setCodeBaseType(newType)
  }

  // React.useEffect(() => {
  //   if (get(formik?.values, buildPath) === RUNTIME_INPUT_VALUE) {
  //     setCodeBaseType(undefined)
  //   }
  // }, [get(formik?.values, buildPath)])

  return (
    <Container className={css.topMargin5}>
      <Text font={{ variation: FontVariation.FORM_LABEL }} tooltipProps={{ dataTooltipId: 'ciCodebaseBuildType' }}>
        {getString('filters.executions.buildType')}
      </Text>
      {isConnectorRuntimeInput ? (
        <Container width={385} className={css.bottomMargin5}>
          <FormInput.MultiTextInput
            name={buildPath}
            label=""
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED]
            }}
            disabled={true}
            style={{ marginBottom: 0, flexGrow: 1 }}
          />
        </Container>
      ) : (
        <Container className={css.bottomMargin3}>
          <Layout.Horizontal
            flex={{ justifyContent: 'start' }}
            padding={{ top: 'small', left: 'xsmall', bottom: 'xsmall' }}
            margin={{ left: 'large' }}
          >
            <Radio
              label={radioLabels['branch']}
              width={110}
              onClick={() => handleTypeChange(CodebaseTypes.branch)}
              checked={codeBaseType === CodebaseTypes.branch}
              disabled={readonly}
              font={{ variation: FontVariation.FORM_LABEL }}
              key="branch-radio-option"
            />
            <Radio
              label={radioLabels['tag']}
              width={90}
              margin={{ left: 'huge' }}
              onClick={() => handleTypeChange(CodebaseTypes.tag)}
              checked={codeBaseType === CodebaseTypes.tag}
              disabled={readonly}
              font={{ variation: FontVariation.FORM_LABEL }}
              key="tag-radio-option"
            />
            {connectorType !== Connectors.AWS_CODECOMMIT ? (
              <Radio
                label={radioLabels['PR']}
                width={110}
                margin={{ left: 'huge' }}
                onClick={() => handleTypeChange(CodebaseTypes.PR)}
                checked={codeBaseType === CodebaseTypes.PR}
                disabled={readonly}
                font={{ variation: FontVariation.FORM_LABEL }}
                key="pr-radio-option"
              />
            ) : null}
          </Layout.Horizontal>
          {formik?.submitCount > 0 && buildTypeError ? (
            <FormError name="spec.build.type" errorMessage={buildTypeError} />
          ) : null}
        </Container>
      )}
      <Container width={width}>
        {codeBaseType === CodebaseTypes.branch ? renderCodeBaseTypeInput({ inputLabels, type: codeBaseType }) : null}
        {codeBaseType === CodebaseTypes.tag ? renderCodeBaseTypeInput({ inputLabels, type: codeBaseType }) : null}
        {codeBaseType === CodebaseTypes.PR ? renderCodeBaseTypeInput({ inputLabels, type: codeBaseType }) : null}
      </Container>
    </Container>
  )
}

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
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType: CIBuildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type')
  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')
  const codebaseConnector = initialValues?.spec?.connectorRef
  // const codebase = (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase
  const connectorId = getIdentifierFromValue(codebaseConnector || '')
  const initialScope = getScopeFromValue(codebaseConnector || '')
  const [codebaseRuntimeInputs, setCodebaseRuntimeInputs] = React.useState<CodebaseRuntimeInputsInterface>({
    ...(isRuntimeInput(codebaseConnector) && { connectorRef: true, repoName: true })
  })
  const [connectorType, setConnectorType] = React.useState<ConnectorInfoDTO['type']>()

  const gitScope = useGitScope()

  const {
    data: connector,
    loading,
    refetch
  } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
      ...(gitScope?.repo && gitScope.branch
        ? { repoIdentifier: gitScope.repo, branch: gitScope.branch, getDefaultFromOtherRepo: true }
        : {})
    },
    lazy: true,
    debounce: 300
  })

  if (connector?.data?.connector && initialValues?.spec) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    initialValues.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }

  // React.useEffect(() => {
  //   if (!loading && !isUndefined(connector)) {
  //     setConnectorType(get(connector, 'data.connector.type', '') as ConnectorInfoDTO['type'])
  //   }

  //   if (connector?.data?.connector) {
  //     setConnectionType(
  //       connector?.data?.connector?.type === Connectors.GIT
  //         ? connector?.data?.connector.spec.connectionType
  //         : connector?.data?.connector.spec.type
  //     )
  //     setConnectorUrl(connector?.data?.connector.spec.url)
  //     if (
  //       connector?.data?.connector?.spec?.type === ConnectionType.Repo ||
  //       connector?.data?.connector?.spec?.type === ConnectionType.Region
  //     ) {
  //       formik.setFieldValue(codeBaseInputFieldFormName.repoName, undefined)
  //     }
  //   }
  // }, [loading, connector])

  // React.useEffect(() => {
  //   const type = get(formik?.values, codeBaseTypePath) as CodeBaseType
  //   if (type) {
  //     setCodeBaseType(type)
  //   }
  //   const typeOfConnector = get(formik?.values, 'connectorRef.connector.type', '') as ConnectorInfoDTO['type']
  //   if (typeOfConnector) {
  //     setConnectorType(typeOfConnector)
  //   } else {
  //     let ctrRef = get(originalPipeline, 'properties.ci.codebase.connectorRef') as string
  //     if (isConnectorExpression) {
  //       return
  //     }
  //     if (isRuntimeInput(ctrRef)) {
  //       ctrRef = get(formik?.values, codeBaseInputFieldFormName.connectorRef, '')
  //     }

  //     setConnectorRef(ctrRef)
  //     setConnectorId(getIdentifierFromValue(ctrRef))
  //   }
  // }, [formik?.values])

  // React.useEffect(() => {
  //   if (!isEmpty(codebaseConnector)) {
  //     refetch()
  //   }
  // }, [codebaseConnector])

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
          getEditViewValidateFieldsConfig(isRuntimeInput(valuesToValidate?.spec?.connectorRef)),
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
        // This is required
        setFormikRef?.(formikRef, formik)
        const connectorWidth = getConnectorRefWidth('DefaultView')
        const connectorRefValue = formik.values.spec?.connectorRef
        const isConnectorRuntimeInput = isRuntimeInput(connectorRefValue)
        const buildPath = 'spec.build'
        const codeBaseTypePath = `spec.build.type`
        const [codeBaseType, setCodeBaseType] = React.useState<CodeBaseType | undefined>(
          get(formik?.values, codeBaseTypePath)
        )
        React.useEffect(() => {
          if (formik?.values?.spec?.connectorRef === RUNTIME_INPUT_VALUE) {
            const newValuesSpec = { ...formik?.values?.spec }
            newValuesSpec.repoName = RUNTIME_INPUT_VALUE
            newValuesSpec.build = RUNTIME_INPUT_VALUE
            // newValuesSpec.build
            // const newBuildValue = { ...formik?.values?.spec?.build }
            // newBuildValue.spec = RUNTIME_INPUT_VALUE
            // spec.build and reponame
            // formik?.setFieldValue(buildPath, RUNTIME_INPUT_VALUE)
            formik?.setValues({ ...formik?.values, spec: newValuesSpec })
            // set build as <+input>
            setCodeBaseType(undefined)
          }
        }, [formik?.values?.spec?.connectorRef])
        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
              enableFields={{
                name: {},
                description: {}
              }}
              formik={formik}
            />
            {/* <CICodebaseInputSetForm
              path=""
              // readonly={readonly}
              // originalPipeline={props.originalPipeline}
              // template={template}
              viewType={stepViewType}
            /> */}
            {renderConnectorAndRepoName({
              values: formik.values,
              setFieldValue: formik.setFieldValue,
              connectorUrl,
              connectionType,
              connectorWidth: isConnectorRuntimeInput ? connectorWidth - runtimeInputGearWidth : connectorWidth,
              setConnectionType,
              setConnectorUrl,
              getString,
              errors: formik.errors,
              loading,
              accountId,
              projectIdentifier,
              orgIdentifier,
              repoIdentifier,
              branch,
              expressions,
              isReadonly,
              setCodebaseRuntimeInputs,
              codebaseRuntimeInputs,
              connectorAndRepoNamePath: 'spec',
              classnames: cx(css.formGroup, css.lg, css.bottomMargin5)
            })}

            {renderBuildType({
              isConnectorRuntimeInput,
              expressions,
              readonly,
              getString,
              formik,
              setCodeBaseType,
              connectorType,
              buildPath,
              codeBaseType,
              width: connectorWidth
            })}
            <Container width={connectorWidth} className={css.bottomMargin5}>
              <FormInput.MultiTextInput
                name="spec.cloneDirectory"
                label={getString('pipeline.gitCloneStep.cloneDirectory')}
                // value="<+input>"
                multiTextInputProps={{
                  expressions,
                  allowableTypes: AllMultiTypeInputTypesForStep
                }}
                style={{ marginBottom: 0, flexGrow: 1 }}
              />
            </Container>
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
                        'spec.privileged': {
                          shouldHide: [
                            CIBuildInfrastructureType.VM,
                            CIBuildInfrastructureType.KubernetesHosted
                          ].includes(buildInfrastructureType)
                        },
                        'spec.settings': {},
                        'spec.reportPaths': {}
                      }}
                    />
                    <StepCommonFields
                      enableFields={['spec.imagePullPolicy']}
                      disabled={readonly}
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

export const GitCloneStepBaseWithRef = React.forwardRef(GitCloneStepBase)
