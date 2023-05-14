/*
 * Copyrig as MultiInputht 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  Accordion,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  Label,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Button,
  Text,
  StepWizard,
  ButtonVariation,
  Icon,
  AllowedTypes,
  Checkbox
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import cx from 'classnames'
import { cloneDeep, set, unset, get, isUndefined, isEmpty, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import type { TerraformVarFileWrapper } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepArtifactoryAuthentication from '@connectors/components/CreateConnector/ArtifactoryConnector/StepAuth/StepArtifactoryAuthentication'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'

import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { FormMultiTypeCheckboxField } from '@common/components'
import StepAWSAuthentication from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import { TFMonaco } from './TFMonacoEditor'

import {
  BackendConfigurationTypes,
  ConfigurationTypes,
  provisionerIdentifierValidation,
  TerraformData,
  TerraformProps,
  TFFormData
} from '../TerraformInterfaces'
import { ConfigFileStoreStepOne } from '../../ConfigFileStore/ConfigFileStoreStepOne'
import { ConfigFileStoreStepTwo } from '../../ConfigFileStore/ConfigFileStoreStepTwo'
import {
  ConnectorMap,
  ConnectorTypes,
  getBuildPayload,
  getConfigFilePath,
  getPath
} from '../../ConfigFileStore/ConfigFileStoreHelper'
import VarFileList from '../../VarFile/VarFileList'
import TerraformCommandFlags from '../../TerraformCommandFlags/TerraformCommandFlags'
import { AmazonS3Store } from '../../ConfigFileStore/AmazonS3Store/AmazonS3Store'
import { AmazonS3StoreDataType, formatAmazonS3Data } from '../../ConfigFileStore/AmazonS3Store/AmazonS3StoreHelper'
import { formatArtifactoryData } from '../../VarFile/helper'
import { ArtifactoryForm } from '../../VarFile/ArtifactoryForm'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../TerraformStep.module.scss'

const setInitialValues = (data: TFFormData): TFFormData => {
  return data
}

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

export default function TerraformEditView(
  props: TerraformProps,
  formikRef: StepFormikFowardRef<TFFormData>
): React.ReactElement {
  const { stepType, isNewStep = true } = props
  const { initialValues, onUpdate, onChange, allowableTypes, stepViewType, readonly = false } = props
  const { getString } = useStrings()
  const { CDS_TERRAFORM_REMOTE_BACKEND_CONFIG_NG, CD_TERRAFORM_CLOUD_CLI_NG, CDS_TERRAFORM_CLI_OPTIONS_NG } =
    useFeatureFlags()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const formikRefValues = React.useRef<FormikProps<unknown> | null>(null)

  let configurationTypes: SelectOption[]
  if (stepType === StepType.TerraformApply) {
    configurationTypes = [
      { label: getString('inline'), value: ConfigurationTypes.Inline },
      { label: getString('pipelineSteps.configTypes.fromPlan'), value: ConfigurationTypes.InheritFromPlan }
    ]
  } else {
    configurationTypes = [
      { label: getString('inline'), value: ConfigurationTypes.Inline },
      { label: getString('pipelineSteps.configTypes.fromPlan'), value: ConfigurationTypes.InheritFromPlan },
      { label: getString('pipelineSteps.configTypes.fromApply'), value: ConfigurationTypes.InheritFromApply }
    ]
  }

  const [isEditMode, setIsEditMode] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)
  const [showBackendConfigRemoteWizard, setShowBackendConfigRemoteWizard] = React.useState(false)
  const [connectorView, setConnectorView] = React.useState(false)
  const [selectedConnector, setSelectedConnector] = React.useState<ConnectorTypes | ''>('')

  const query = useQueryParams()
  const sectionId = (query as any).sectionId || ''

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const getNewConnectorSteps = () => {
    const connectorType = ConnectorMap[selectedConnector]
    const buildPayload = getBuildPayload(ConnectorMap[selectedConnector])
    const gitTypeStoreAuthenticationProps = {
      name: getString('credentials'),
      isEditMode,
      setIsEditMode,
      accountId,
      orgIdentifier,
      projectIdentifier,
      connectorInfo: undefined,
      onConnectorCreated: noop
    }
    const authenticationStepProps = {
      ...gitTypeStoreAuthenticationProps,
      identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER
    }
    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={connectorType}
          name={getString('overview')}
          isEditMode={isEditMode}
          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
        />
        {connectorType !== Connectors.ARTIFACTORY && connectorType !== Connectors.AWS ? (
          <GitDetailsStep
            type={connectorType}
            name={getString('details')}
            isEditMode={isEditMode}
            connectorInfo={undefined}
          />
        ) : null}
        {connectorType === Connectors.GIT ? <StepGitAuthentication {...authenticationStepProps} /> : null}
        {connectorType === Connectors.GITHUB ? <StepGithubAuthentication {...authenticationStepProps} /> : null}
        {connectorType === Connectors.BITBUCKET ? <StepBitbucketAuthentication {...authenticationStepProps} /> : null}
        {connectorType === Connectors.GITLAB ? <StepGitlabAuthentication {...authenticationStepProps} /> : null}
        {connectorType === Connectors.ARTIFACTORY ? (
          <StepArtifactoryAuthentication {...authenticationStepProps} />
        ) : null}
        {connectorType === Connectors.AWS ? <StepAWSAuthentication {...authenticationStepProps} /> : null}
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          buildPayload={buildPayload}
          connectorInfo={undefined}
        />
        <ConnectorTestConnection
          name={getString('connectors.stepThreeName')}
          connectorInfo={undefined}
          isStep={true}
          isLastStep={false}
          type={connectorType}
        />
      </StepWizard>
    )
  }

  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 1) {
      setConnectorView(false)
    }
  }

  const getTitle = (isBackendConfig: boolean): React.ReactElement => (
    <Layout.Vertical flex style={{ justifyContent: 'center', alignItems: 'center' }} margin={{ bottom: 'xlarge' }}>
      <Icon name="service-terraform" size={50} padding={{ bottom: 'large' }} />
      <Text color={Color.WHITE}>
        {isBackendConfig ? getString('cd.backendConfigFileStoreTitle') : getString('cd.terraformConfigFileStore')}
      </Text>
    </Layout.Vertical>
  )

  const onCloseConfigWizard = (): void => {
    setSelectedConnector('Git')
    setConnectorView(false)
    setShowModal(false)
    setIsEditMode(false)
  }

  const onCloseBackendConfigWizard = (): void => {
    setSelectedConnector('Git')
    setConnectorView(false)
    setShowBackendConfigRemoteWizard(false)
    setIsEditMode(false)
  }

  const onSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (field: string, value: any) => void,
    fieldPath: string
  ): void => {
    const fieldName = `spec.${fieldPath}.spec.backendConfig`
    if (e.target.value === BackendConfigurationTypes.Inline) {
      setFieldValue(fieldName, {
        type: BackendConfigurationTypes.Inline,
        spec: {
          content: ''
        }
      })
    } else if (e.target.value === BackendConfigurationTypes.Remote) {
      setFieldValue(fieldName, {
        type: BackendConfigurationTypes.Remote,
        spec: {
          store: {
            type: 'Git',
            spec: {
              connectorRef: undefined,
              gitFetchType: 'Branch'
            }
          }
        }
      })
    }
  }

  const newConfigFileComponent = (
    formik: any,
    isConfig: boolean,
    isBackendConfig: boolean,
    fieldPath: string
  ): React.ReactElement => {
    const stepTwoName = isBackendConfig ? getString('cd.backendConfigFileDetails') : getString('cd.configFileDetails')

    return (
      <StepWizard title={getTitle(isBackendConfig)} className={css.configWizard} onStepChange={onStepChange}>
        <ConfigFileStoreStepOne
          name={isBackendConfig ? getString('cd.backendConfigFileStepOne') : getString('cd.terraformConfigFileStepOne')}
          data={formik.values}
          isBackendConfig={isBackendConfig}
          isReadonly={readonly}
          isEditMode={isEditMode}
          allowableTypes={allowableTypes}
          setConnectorView={setConnectorView}
          selectedConnector={selectedConnector}
          setSelectedConnector={setSelectedConnector}
          isTerragrunt={false}
          fieldPath={fieldPath}
        />
        {connectorView ? getNewConnectorSteps() : null}
        {selectedConnector === 'Artifactory' ? (
          <ArtifactoryForm
            isConfig={isConfig}
            isTerraformPlan={false}
            isBackendConfig={isBackendConfig}
            allowableTypes={allowableTypes}
            fieldPath={fieldPath}
            name={stepTwoName}
            onSubmitCallBack={(data: any, prevStepData: any) => {
              const path = getPath(false, false, isBackendConfig, fieldPath)
              const configObject = get(prevStepData?.formValues, path)

              const valObj = formatArtifactoryData(
                prevStepData,
                data,
                configObject,
                formik,
                isBackendConfig ? `spec.${fieldPath}.backendConfig.spec` : `spec.${fieldPath}.configFiles`
              )
              set(valObj, path, { ...configObject })
              formik.setValues(valObj)
              setConnectorView(false)
              setShowModal(false)
              setShowBackendConfigRemoteWizard(false)
            }}
          />
        ) : selectedConnector === 'S3' ? (
          <AmazonS3Store
            isConfig={isConfig}
            isBackendConfig={isBackendConfig}
            allowableTypes={allowableTypes}
            fieldPath={fieldPath}
            specFieldPath={`spec.${fieldPath}.spec`}
            name={stepTwoName}
            isReadonly={readonly}
            onSubmitCallBack={(data: AmazonS3StoreDataType, prevStepData: any) => {
              const path = getPath(false, false, isBackendConfig, fieldPath)
              const configStoreObject = get(prevStepData?.formValues, path)

              const valObj = formatAmazonS3Data(prevStepData, data, configStoreObject, formik, path)

              set(valObj, path, { ...configStoreObject })
              formik.setValues(valObj)
              setConnectorView(false)
              setShowModal(false)
              setShowBackendConfigRemoteWizard(false)
            }}
          />
        ) : (
          <ConfigFileStoreStepTwo
            name={stepTwoName}
            isBackendConfig={isBackendConfig}
            isReadonly={readonly}
            allowableTypes={allowableTypes}
            fieldPath={fieldPath}
            onSubmitCallBack={(data: any, prevStepData: any) => {
              const path = getPath(false, false, isBackendConfig, fieldPath)
              const configObject = get(data, path) || {
                store: {}
              }
              if (data?.store?.type === 'Harness') {
                configObject.store = data?.store
              } else {
                configObject.moduleSource =
                  data?.type === 'TerraformPlan'
                    ? get(data.spec, `${fieldPath}.configFiles.moduleSource`)
                    : get(data.spec, `${fieldPath}.spec.configFiles.moduleSource`)

                if (prevStepData.identifier && prevStepData.identifier !== data?.identifier) {
                  configObject.store.spec.connectorRef = prevStepData?.identifier
                }

                if (configObject?.store?.type === 'S3') {
                  unset(configObject?.store?.spec, 'region')
                  unset(configObject?.store?.spec, 'bucketName')
                  unset(configObject?.store?.spec, 'paths')
                }

                if (configObject?.store.spec.gitFetchType === 'Branch') {
                  unset(configObject.store.spec, 'commitId')
                } else if (configObject?.store.spec.gitFetchType === 'Commit') {
                  unset(configObject.store.spec, 'branch')
                }
                if (configObject?.store?.spec?.artifactPaths) {
                  unset(configObject?.store?.spec, 'artifactPaths')
                  unset(configObject?.store?.spec, 'repositoryName')
                }
                if (configObject?.store?.spec?.files) {
                  unset(configObject?.store?.spec, 'files')
                }
                if (configObject?.store?.spec?.secretFiles) {
                  unset(configObject?.store?.spec, 'secretFiles')
                }
              }
              const valObj = cloneDeep(formik.values)
              configObject.store.type = prevStepData?.selectedType
              set(valObj, path, { ...configObject })
              formik.setValues(valObj)
              setConnectorView(false)
              setShowModal(false)
              setShowBackendConfigRemoteWizard(false)
            }}
          />
        )}
      </StepWizard>
    )
  }

  const inlineBackendConfig = (formik: FormikProps<TFFormData>, fieldPath: string): React.ReactElement => (
    <div className={cx(stepCss.formGroup, css.addMarginBottom)}>
      <MultiTypeFieldSelector
        name={`spec.${fieldPath}.spec.backendConfig.spec.content`}
        label={
          <Text style={{ color: 'rgb(11, 11, 13)' }}>
            {getString('optionalField', { name: getString('cd.backEndConfig') })}
          </Text>
        }
        defaultValueToReset=""
        allowedTypes={allowableTypes}
        skipRenderValueInExpressionLabel
        disabled={readonly}
        expressionRender={() => {
          return (
            <TFMonaco
              name={`spec.${fieldPath}.spec.backendConfig.spec.content`}
              formik={formik as FormikProps<unknown>}
              expressions={expressions}
              title={getString('cd.backEndConfig')}
            />
          )
        }}
      >
        <TFMonaco
          name={`spec.${fieldPath}.spec.backendConfig.spec.content`}
          formik={formik as FormikProps<unknown>}
          expressions={expressions}
          title={getString('cd.backEndConfig')}
        />
      </MultiTypeFieldSelector>
      {getMultiTypeFromValue(get(formik.values.spec, `${fieldPath}.spec.backendConfig.spec.content`)) ===
        MultiTypeInputType.RUNTIME && (
        <ConfigureOptions
          value={get(formik.values.spec, `${fieldPath}.spec.backendConfig.spec.content`) as string}
          type="String"
          variableName={`spec.${fieldPath}.spec.backendConfig.spec.content`}
          showRequiredField={false}
          showDefaultField={false}
          onChange={value => formik.setFieldValue(`spec.${fieldPath}.spec.backendConfig.spec.content`, value)}
          isReadonly={readonly}
        />
      )}
    </div>
  )

  const skipRefreshCommandComponent = (formik: FormikProps<unknown>) => {
    return (
      <div className={cx(stepCss.formGroup, css.addMarginTop)}>
        <FormMultiTypeCheckboxField
          formik={formik}
          name={'spec.configuration.skipRefreshCommand'}
          label={getString('cd.skipRefreshCommand')}
          multiTypeTextbox={{ expressions, allowableTypes }}
          disabled={readonly}
          setToFalseWhenEmpty
        />
        {getMultiTypeFromValue((formik?.values as TerraformData)?.spec?.configuration?.skipRefreshCommand) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={((formik?.values as TerraformData)?.spec?.configuration?.skipRefreshCommand || '') as string}
            type="String"
            variableName="spec.configuration.skipRefreshCommand"
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanul ignore next */
              value => formik?.setFieldValue('spec.configuration.skipRefreshCommand', value)
            }
            style={{ alignSelf: 'center' }}
            isReadonly={readonly}
          />
        )}
      </div>
    )
  }

  const [enableCloudCli, setEnableCloudCli] = React.useState<boolean | undefined>(undefined)

  useEffect(() => {
    setEnableCloudCli(prevEnableCloudCli => {
      if (isUndefined(prevEnableCloudCli)) {
        return (
          !isEmpty((formikRefValues?.current?.values as TerraformData)?.spec?.cloudCliConfiguration) &&
          !isUndefined((formikRefValues?.current?.values as TerraformData)?.spec?.cloudCliConfiguration)
        )
      }
      return prevEnableCloudCli
    })
  }, [])

  const fieldPath = enableCloudCli ? 'cloudCliConfiguration' : 'configuration'

  const regularValidationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: !enableCloudCli
      ? Yup.object().shape({
          provisionerIdentifier: provisionerIdentifierValidation(getString),
          configuration: Yup.object().shape({
            type: Yup.string().required(getString('pipelineSteps.configurationTypeRequired'))
          })
        })
      : Yup.object().shape({
          provisionerIdentifier: provisionerIdentifierValidation(getString)
        })
  })

  return (
    <>
      <Formik<TFFormData>
        onSubmit={values => {
          const payload = {
            ...values
          }
          onUpdate?.(payload as any)
        }}
        validate={values => {
          const payload = {
            ...values
          }
          onChange?.(payload as any)
        }}
        formName={`terraformEdit-${stepType}-${sectionId}`}
        initialValues={setInitialValues(initialValues as any)}
        validationSchema={regularValidationSchema}
      >
        {(formik: FormikProps<TFFormData>) => {
          const { values, setFieldValue } = formik
          formikRefValues.current = formik as FormikProps<unknown> | null
          setFormikRef(formikRef, formik)

          const configFile = get(values.spec, `${fieldPath}.spec.configFiles`)
          const configFilePath = getConfigFilePath(configFile)
          const backendConfigFile =
            get(values.spec, `${fieldPath}.spec.backendConfig.type`) === BackendConfigurationTypes.Remote
              ? get(values.spec, `${fieldPath}.spec.backendConfig`)
              : undefined
          const backendConfigFilePath = getConfigFilePath(backendConfigFile?.spec)

          return (
            <>
              {stepViewType !== StepViewType.Template && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{
                      placeholder: getString('pipeline.stepNamePlaceholder'),
                      disabled: readonly
                    }}
                  />
                </div>
              )}

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
                  disabled={readonly}
                />
              </div>
              <div className={css.divider} />
              {CD_TERRAFORM_CLOUD_CLI_NG && (
                <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                  <Checkbox
                    label={getString('pipeline.terraformStep.runOnRemote')}
                    checked={enableCloudCli}
                    onChange={e => {
                      setEnableCloudCli((e.target as any).checked)
                      unset(values, (e.target as any).checked ? 'spec.configuration' : 'spec.cloudCliConfiguration')
                    }}
                  />
                </div>
              )}
              {!enableCloudCli && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={configurationTypes}
                    key={fieldPath}
                    name={`spec.configuration.type`}
                    label={getString('pipelineSteps.configurationType')}
                    placeholder={getString('pipelineSteps.configurationType')}
                    disabled={readonly}
                  />
                </div>
              )}
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.MultiTextInput
                  name="spec.provisionerIdentifier"
                  placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
                  label={getString('pipelineSteps.provisionerIdentifier')}
                  multiTextInputProps={{ expressions, allowableTypes }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(values.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.spec?.provisionerIdentifier as string}
                    type="String"
                    variableName="spec.provisionerIdentifier"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      setFieldValue('spec.provisionerIdentifier', value)
                    }}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                  />
                )}
              </div>

              {(enableCloudCli || formik.values?.spec?.configuration?.type === ConfigurationTypes.Inline) && (
                <>
                  <>
                    <Layout.Vertical>
                      <Label
                        style={{ color: Color.GREY_900 }}
                        className={css.configLabel}
                        data-tooltip-id="tfConfigurationFile"
                      >
                        {getString('cd.configurationFile')}
                        <HarnessDocTooltip useStandAlone={true} tooltipId="tfConfigurationFile" />
                      </Label>
                      <div className={cx(css.configFile, css.addMarginBottom)}>
                        <div className={css.configField}>
                          {!configFilePath && (
                            <a
                              data-testid="editConfigButton"
                              className={css.configPlaceHolder}
                              data-name="config-edit"
                              onClick={() => setShowModal(true)}
                            >
                              {getString('cd.configFilePlaceHolder')}
                            </a>
                          )}
                          {configFilePath && (
                            <Text font="normal" lineClamp={1} width={200} data-testid={configFilePath}>
                              /{configFilePath}
                            </Text>
                          )}
                          {configFilePath ? (
                            <Button
                              minimal
                              icon="Edit"
                              withoutBoxShadow
                              iconProps={{ size: 16 }}
                              onClick={() => setShowModal(true)}
                              data-name="config-edit"
                              withoutCurrentColor={true}
                              className={css.editBtn}
                            />
                          ) : null}
                        </div>
                      </div>
                    </Layout.Vertical>
                  </>
                  <Accordion className={stepCss.accordion}>
                    <Accordion.Panel
                      id="step-1"
                      summary={getString('common.optionalConfig')}
                      details={
                        <div className={css.optionalConfigDetails}>
                          {!enableCloudCli && values?.spec?.configuration?.type === ConfigurationTypes.Inline && (
                            <div className={cx(stepCss.formGroup, stepCss.md)}>
                              <FormInput.MultiTextInput
                                name="spec.configuration.spec.workspace"
                                placeholder={getString('pipeline.terraformStep.workspace')}
                                label={getString('pipelineSteps.workspace')}
                                multiTextInputProps={{ expressions, allowableTypes }}
                                isOptional={true}
                                disabled={readonly}
                              />
                              {getMultiTypeFromValue(formik.values.spec?.configuration?.spec?.workspace) ===
                                MultiTypeInputType.RUNTIME && (
                                <ConfigureOptions
                                  value={formik.values?.spec?.configuration?.spec?.workspace as string}
                                  type="String"
                                  variableName="configuration.spec.workspace"
                                  showRequiredField={false}
                                  showDefaultField={false}
                                  onChange={value => {
                                    formik.setFieldValue('spec.configuration.spec.workspace', value)
                                  }}
                                  isReadonly={readonly}
                                  allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                                />
                              )}
                            </div>
                          )}
                          <div className={cx(css.divider, css.addMarginBottom)} />
                          <VarFileList<TerraformData, TerraformVarFileWrapper>
                            formik={formik as FormikProps<TerraformData>}
                            isReadonly={readonly}
                            allowableTypes={allowableTypes}
                            setSelectedConnector={setSelectedConnector}
                            getNewConnectorSteps={getNewConnectorSteps}
                            selectedConnector={selectedConnector}
                            varFilePath={`spec.${fieldPath}.spec.varFiles`}
                          />
                          <div className={css.divider} />
                          {CDS_TERRAFORM_REMOTE_BACKEND_CONFIG_NG ? (
                            <>
                              <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
                                {get(values.spec, `${fieldPath}.spec.backendConfig.type`) ===
                                  BackendConfigurationTypes.Remote && (
                                  <Layout.Vertical>
                                    <Label
                                      data-tooltip-id={'TF-apply-remoteBackendConfiguration'}
                                      style={{ color: Color.GREY_900 }}
                                      className={css.configLabel}
                                    >
                                      {getString('cd.backendConfigurationFile')}
                                      <HarnessDocTooltip
                                        useStandAlone={true}
                                        tooltipId="TF-apply-remoteBackendConfiguration"
                                      />
                                    </Label>
                                  </Layout.Vertical>
                                )}
                                <div className={css.fileSelect}>
                                  <select
                                    className={css.fileDropdown}
                                    name={`spec.${fieldPath}.spec.backendConfig.type`}
                                    disabled={readonly}
                                    value={
                                      get(values?.spec, `${fieldPath}.spec.backendConfig.type`) ||
                                      BackendConfigurationTypes.Inline
                                    }
                                    onChange={e => {
                                      /* istanbul ignore next */
                                      onSelectChange(e, setFieldValue, fieldPath)
                                    }}
                                    data-testid="backendConfigurationOptions"
                                  >
                                    <option value={BackendConfigurationTypes.Inline}>{getString('inline')}</option>
                                    <option value={BackendConfigurationTypes.Remote}>{getString('remote')}</option>
                                  </select>
                                </div>
                              </Layout.Horizontal>
                              {get(values?.spec, `${fieldPath}.spec.backendConfig.type`) ===
                              BackendConfigurationTypes.Remote ? (
                                <div
                                  className={cx(css.configFile, css.configField, css.addMarginTop, css.addMarginBottom)}
                                  onClick={() => {
                                    /* istanbul ignore next */
                                    setShowBackendConfigRemoteWizard(true)
                                  }}
                                  data-testid="remoteTemplate"
                                >
                                  <>
                                    {!backendConfigFilePath && (
                                      <a
                                        className={css.configPlaceHolder}
                                        onClick={() => setShowBackendConfigRemoteWizard(true)}
                                      >
                                        {getString('cd.backendConfigFilePlaceHolder')}
                                      </a>
                                    )}
                                    {backendConfigFilePath && (
                                      <>
                                        <Text font="normal" lineClamp={1} width={200}>
                                          /{backendConfigFilePath}
                                        </Text>
                                        <Button
                                          minimal
                                          icon="Edit"
                                          withoutBoxShadow
                                          iconProps={{ size: 16 }}
                                          data-name="backend-config-edit"
                                          withoutCurrentColor={true}
                                        />
                                      </>
                                    )}
                                  </>
                                </div>
                              ) : (
                                inlineBackendConfig(formik, fieldPath)
                              )}
                            </>
                          ) : (
                            inlineBackendConfig(formik, fieldPath)
                          )}
                          <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                            <MultiTypeList
                              multiTextInputProps={{
                                expressions,
                                allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                                  item => !isMultiTypeRuntime(item)
                                ) as AllowedTypes
                              }}
                              name={`spec.${fieldPath}.spec.targets`}
                              placeholder={getString('cd.enterTragets')}
                              disabled={readonly}
                              multiTypeFieldSelectorProps={{
                                label: (
                                  <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                                    {getString('optionalField', { name: getString('pipeline.targets.title') })}
                                  </Text>
                                )
                              }}
                              style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
                            />
                          </div>
                          <div className={css.divider} />
                          <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                            <MultiTypeMap
                              valueMultiTextInputProps={{
                                expressions,
                                allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                                  item => !isMultiTypeRuntime(item)
                                ) as AllowedTypes
                              }}
                              name={`spec.${fieldPath}.spec.environmentVariables`}
                              multiTypeFieldSelectorProps={{
                                disableTypeSelection: true,
                                label: (
                                  <Text style={{ display: 'flex', alignItems: 'center', color: 'rgb(11, 11, 13)' }}>
                                    {getString('optionalField', { name: getString('environmentVariables') })}
                                  </Text>
                                )
                              }}
                              disabled={readonly}
                            />
                          </div>
                        </div>
                      }
                    />
                    {CDS_TERRAFORM_CLI_OPTIONS_NG && (
                      <Accordion.Panel
                        id="step-2"
                        summary={getString('cd.commandLineOptions')}
                        details={
                          <div>
                            {!enableCloudCli && skipRefreshCommandComponent(formik as FormikProps<unknown>)}
                            <div>
                              <TerraformCommandFlags
                                formik={formik}
                                stepType={initialValues?.type === StepType.TerraformDestroy ? 'DESTROY' : 'APPLY'}
                                configType={fieldPath}
                                allowableTypes={allowableTypes}
                                path={`spec.${fieldPath}.commandFlags`}
                              />
                            </div>
                          </div>
                        }
                      />
                    )}
                  </Accordion>
                </>
              )}

              {CDS_TERRAFORM_CLI_OPTIONS_NG &&
                (values?.spec?.configuration?.type === ConfigurationTypes.InheritFromApply ||
                  values?.spec?.configuration?.type === ConfigurationTypes.InheritFromPlan) && (
                  <Accordion className={stepCss.accordion}>
                    <Accordion.Panel
                      id="step-1"
                      summary={getString('cd.commandLineOptions')}
                      details={
                        <div>
                          {initialValues?.type === StepType.TerraformDestroy &&
                            values?.spec?.configuration?.type === ConfigurationTypes.InheritFromApply &&
                            skipRefreshCommandComponent(formik as FormikProps<unknown>)}

                          <div>
                            <TerraformCommandFlags
                              formik={formik}
                              stepType={initialValues?.type === StepType.TerraformDestroy ? 'DESTROY' : 'APPLY'}
                              configType={fieldPath}
                              allowableTypes={allowableTypes}
                              path={`spec.${fieldPath}.commandFlags`}
                            />
                          </div>
                        </div>
                      }
                    />
                  </Accordion>
                )}

              {showModal && (
                <Dialog
                  {...DIALOG_PROPS}
                  isCloseButtonShown
                  onClose={() => {
                    setConnectorView(false)
                    setShowModal(false)
                  }}
                  className={cx(css.modal, Classes.DIALOG)}
                >
                  <div className={css.createTfWizard}>{newConfigFileComponent(formik, true, false, fieldPath)}</div>
                  <Button
                    variation={ButtonVariation.ICON}
                    icon="cross"
                    iconProps={{ size: 18 }}
                    onClick={onCloseConfigWizard}
                    className={css.crossIcon}
                  />
                </Dialog>
              )}
              {showBackendConfigRemoteWizard && (
                <Dialog
                  {...DIALOG_PROPS}
                  isOpen={true}
                  isCloseButtonShown
                  onClose={() => {
                    setConnectorView(false)
                    setShowBackendConfigRemoteWizard(false)
                  }}
                  className={cx(css.modal, Classes.DIALOG)}
                >
                  <div className={css.createTfWizard}>{newConfigFileComponent(formik, false, true, fieldPath)}</div>
                  <Button
                    variation={ButtonVariation.ICON}
                    icon="cross"
                    iconProps={{ size: 18 }}
                    onClick={onCloseBackendConfigWizard}
                    data-testid={'close-wizard'}
                    className={css.crossIcon}
                  />
                </Dialog>
              )}
            </>
          )
        }}
      </Formik>
    </>
  )
}
