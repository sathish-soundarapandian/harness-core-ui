/*
 * Copyrig as MultiInputht 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
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
  FormError
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import cx from 'classnames'
import { cloneDeep, set, unset, get } from 'lodash-es'

import type { FormikProps } from 'formik'
import { Classes, Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'
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
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { isMultiTypeRuntime } from '@common/utils/utils'
import {
  ConnectorMap,
  ConnectorTypes,
  getBuildPayload,
  getConfigFilePath,
  getPath
} from '../../ConfigFileStore/ConfigFileStoreHelper'
import { TFArtifactoryForm } from '../../Terraform/Editview/TerraformArtifactoryForm'
import { BackendConfigurationTypes, ConfigurationTypes } from '../../Terraform/TerraformInterfaces'
import { formatArtifactoryData } from '../../Terraform/Editview/TerraformArtifactoryFormHelper'
import type { TerragruntData, TerragruntProps } from '../TerragruntInterface'
import { ConfigFileStoreStepOne } from '../../ConfigFileStore/ConfigFileStoreStepOne'
import { ConfigFileStoreStepTwo } from '../../ConfigFileStore/ConfigFileStoreStepTwo'
import TgVarFileList from './TGVarFileList'
import { DIALOG_PROPS } from '../TerragruntHelper'
import css from '../../Terraform/Editview/TerraformVarfile.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

export default function TerragruntEitView(
  props: TerragruntProps,
  formikRef: StepFormikFowardRef<TerragruntData>
): React.ReactElement {
  const { stepType, isNewStep = true } = props
  const { initialValues, onUpdate, onChange, allowableTypes, stepViewType, readonly = false } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const regularValidationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      provisionerIdentifier: Yup.lazy((value): Yup.Schema<unknown> => {
        if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
          return IdentifierSchemaWithOutName(getString, {
            requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
            regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
          })
        }
        return Yup.string().required(getString('common.validation.provisionerIdentifierIsRequired'))
      }),
      configuration: Yup.object().shape({
        type: Yup.string().required(getString('pipelineSteps.configurationTypeRequired'))
      })
    })
  })
  let configurationTypes: SelectOption[]

  if (stepType === StepType.TerragruntApply) {
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

  const { sectionId } = useQueryParams<any>()

  const getNewConnectorSteps = () => {
    const connectorType = ConnectorMap[selectedConnector]
    const buildPayload = getBuildPayload(connectorType)
    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={connectorType}
          name={getString('overview')}
          isEditMode={isEditMode}
          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
        />
        {connectorType !== Connectors.ARTIFACTORY ? (
          <GitDetailsStep
            type={connectorType}
            name={getString('details')}
            isEditMode={isEditMode}
            connectorInfo={undefined}
          />
        ) : null}
        {connectorType === Connectors.GIT ? (
          <StepGitAuthentication
            name={getString('credentials')}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {connectorType === Connectors.GITHUB ? (
          <StepGithubAuthentication
            name={getString('credentials')}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {connectorType === Connectors.BITBUCKET ? (
          <StepBitbucketAuthentication
            name={getString('credentials')}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {connectorType === Connectors.GITLAB ? (
          <StepGitlabAuthentication
            name={getString('credentials')}
            identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
            onConnectorCreated={() => {
              // Handle on success
            }}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
        {connectorType === Connectors.ARTIFACTORY ? (
          <StepArtifactoryAuthentication
            name={getString('details')}
            identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            connectorInfo={undefined}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
          />
        ) : null}
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
      <Icon
        name={isBackendConfig ? 'service-terraform' : 'service-terragrunt'}
        className={css.remoteIcon}
        size={50}
        padding={{ bottom: 'large' }}
      />
      <Text color={Color.WHITE}>
        {isBackendConfig ? getString('cd.backendConfigFileStoreTitle') : getString('cd.terragruntConfigFileStore')}
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
  const newConfigFileComponent = (
    formik: FormikProps<TerragruntData>,
    isConfig: boolean,
    isBackendConfig: boolean
  ): React.ReactElement => {
    return (
      <StepWizard title={getTitle(isBackendConfig)} className={css.configWizard} onStepChange={onStepChange}>
        <ConfigFileStoreStepOne
          name={
            isBackendConfig ? getString('cd.backendConfigFileStepOne') : getString('cd.terragruntConfigFileStepOne')
          }
          data={formik.values}
          isBackendConfig={isBackendConfig}
          isReadonly={readonly}
          isEditMode={isEditMode}
          allowableTypes={allowableTypes}
          setConnectorView={setConnectorView}
          selectedConnector={selectedConnector}
          setSelectedConnector={setSelectedConnector}
          isTerragruntPlan={false}
          isTerragrunt
        />
        {connectorView ? getNewConnectorSteps() : null}
        {selectedConnector === 'Artifactory' ? (
          <TFArtifactoryForm
            isConfig={isConfig}
            isTerraformPlan={false}
            isBackendConfig={isBackendConfig}
            allowableTypes={allowableTypes}
            name={isBackendConfig ? getString('cd.backendConfigFileDetails') : getString('cd.configFileDetails')}
            onSubmitCallBack={(data: any, prevStepData: any) => {
              const path = getPath(false, false, isBackendConfig)
              const configObject = get(prevStepData?.formValues, path)

              const valObj = formatArtifactoryData(
                prevStepData,
                data,
                configObject,
                formik,
                isBackendConfig ? 'spec.configuration.backendConfig.spec' : 'spec.configuration.configFiles'
              )
              set(valObj, path, { ...configObject })
              formik.setValues(valObj)
              setConnectorView(false)
              setShowModal(false)
            }}
          />
        ) : (
          <ConfigFileStoreStepTwo
            name={isBackendConfig ? getString('cd.backendConfigFileDetails') : getString('cd.configFileDetails')}
            isBackendConfig={isBackendConfig}
            isTerragruntPlan={false}
            isReadonly={readonly}
            allowableTypes={allowableTypes}
            onSubmitCallBack={(data: any, prevStepData: any) => {
              const path = getPath(false, false, isBackendConfig)
              const configObject = get(data, path) || {
                store: {}
              }
              if (data?.store?.type === 'Harness') {
                configObject.store = data?.store
              } else {
                configObject.moduleSource = data.spec?.configuration?.spec?.configFiles?.moduleSource

                if (prevStepData.identifier && prevStepData.identifier !== data?.identifier) {
                  configObject.store.spec.connectorRef = prevStepData?.identifier
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
            }}
          />
        )}
      </StepWizard>
    )
  }

  const inlineBackendConfig = (formik: FormikProps<TerragruntData>): React.ReactElement => (
    <div className={cx(stepCss.formGroup, stepCss.alignStart)}>
      <MultiTypeFieldSelector
        name="spec.configuration.spec.backendConfig.spec.content"
        label={
          <Text style={{ color: 'rgb(11, 11, 13)' }}>
            {getString('optionalField', { name: getString('cd.backEndConfig') })}
          </Text>
        }
        defaultValueToReset=""
        allowedTypes={allowableTypes}
        skipRenderValueInExpressionLabel
        disabled={readonly}
        expressionRender={
          /* istanbul ignore next */ () => {
            return (
              <MonacoTextField
                name="spec.configuration.spec.backendConfig.spec.content"
                expressions={expressions}
                height={300}
                disabled={readonly}
                fullScreenAllowed
                fullScreenTitle={getString('optionalField', { name: getString('cd.backEndConfig') })}
              />
            )
          }
        }
      >
        <MonacoTextField
          name="spec.configuration.spec.backendConfig.spec.content"
          expressions={expressions}
          height={300}
          disabled={readonly}
          fullScreenAllowed
          fullScreenTitle={getString('optionalField', { name: getString('cd.backEndConfig') })}
        />
      </MultiTypeFieldSelector>
      {getMultiTypeFromValue(formik.values.spec.configuration?.spec?.backendConfig?.spec?.content) ===
        MultiTypeInputType.RUNTIME && (
        <ConfigureOptions
          value={formik.values.spec.configuration?.spec?.backendConfig?.spec?.content as string}
          type="String"
          variableName="spec.configuration.spec.backendConfig.spec.content"
          showRequiredField={false}
          showDefaultField={false}
          showAdvanced={true}
          onChange={value => formik.setFieldValue('spec.configuration.spec.backendConfig.spec.content', value)}
          isReadonly={readonly}
        />
      )}
    </div>
  )
  const onSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (field: string, value: any) => void
  ): void => {
    const fieldName = 'spec.configuration.spec.backendConfig'
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

  return (
    <>
      <Formik<TerragruntData>
        onSubmit={values => {
          const payload = {
            ...values
          }
          onUpdate?.(payload)
        }}
        validate={values => {
          const payload = {
            ...values
          }
          onChange?.(payload)
        }}
        formName={`terragruntEdit-${stepType}-${sectionId}`}
        initialValues={initialValues}
        validationSchema={regularValidationSchema}
      >
        {(formik: FormikProps<TerragruntData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)

          const configFile = formik.values.spec.configuration.spec?.configFiles
          const configFilePath = getConfigFilePath(configFile)
          const backendConfigFile =
            formik.values.spec.configuration.spec?.backendConfig?.type === BackendConfigurationTypes.Remote
              ? values?.spec?.configuration?.spec?.backendConfig
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

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.Select
                  items={configurationTypes}
                  name="spec.configuration.type"
                  label={getString('pipelineSteps.configurationType')}
                  placeholder={getString('pipelineSteps.configurationType')}
                  disabled={readonly}
                />
              </div>

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
                    showAdvanced
                    onChange={value => {
                      setFieldValue('spec.provisionerIdentifier', value)
                    }}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                  />
                )}
              </div>

              {formik.values.spec?.configuration?.type === ConfigurationTypes.Inline && (
                <>
                  <Layout.Vertical>
                    <Label
                      style={{ color: Color.GREY_900 }}
                      className={css.configLabel}
                      data-tooltip-id="tgConfigurationFile"
                    >
                      {getString('cd.configurationFile')}
                      <HarnessDocTooltip useStandAlone={true} tooltipId="tgConfigurationFile" />
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
                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.RadioGroup
                        disabled={readonly}
                        name="spec.configuration.spec.moduleConfig.terragruntRunType"
                        radioGroup={{ inline: true }}
                        label={getString('cd.moduleConfiguration')}
                        items={[
                          { label: 'All Modules', value: 'RunAll' },
                          { label: 'Specific Module', value: 'RunModule' }
                        ]}
                      />
                    </div>

                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.MultiTextInput
                        name="spec.configuration.spec.moduleConfig.path"
                        placeholder={'Enter path'}
                        label={getString('common.path')}
                        multiTextInputProps={{ expressions, allowableTypes }}
                        disabled={readonly}
                      />
                      {getMultiTypeFromValue(values.spec.configuration.spec?.moduleConfig?.path) ===
                        MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={values.spec?.configuration.spec?.moduleConfig?.path as string}
                          type={getString('string')}
                          variableName="spec.configuration.spec.moduleConfig.path"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced
                          onChange={value => {
                            setFieldValue('spec.configuration.spec.moduleConfig.path', value)
                          }}
                          isReadonly={readonly}
                          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                        />
                      )}
                    </div>
                    {values?.spec?.configuration?.type === ConfigurationTypes.Inline &&
                    !formik.values?.spec?.configuration?.spec?.moduleConfig?.path ? (
                      <FormError
                        name="spec.configuration.spec.moduleConfig.path"
                        errorMessage={getString('fieldRequired', { field: getString('common.path') })}
                      />
                    ) : null}
                  </Layout.Vertical>

                  <Accordion className={stepCss.accordion}>
                    <Accordion.Panel
                      id="step-1"
                      summary={getString('common.optionalConfig')}
                      details={
                        <div className={css.optionalConfigDetails}>
                          {formik.values.spec.configuration.type === ConfigurationTypes.Inline && (
                            <div className={cx(stepCss.formGroup, stepCss.md)}>
                              <FormInput.MultiTextInput
                                name="spec.configuration.spec.workspace"
                                placeholder={getString('pipeline.terraformStep.workspace')}
                                label={getString('pipelineSteps.workspace')}
                                multiTextInputProps={{ expressions, allowableTypes }}
                                isOptional={true}
                                disabled={readonly}
                              />
                              {getMultiTypeFromValue(formik.values.spec.configuration.spec?.workspace) ===
                                MultiTypeInputType.RUNTIME && (
                                <ConfigureOptions
                                  value={formik.values?.spec?.configuration?.spec?.workspace as string}
                                  type="String"
                                  variableName="spec.configuration.spec.workspace"
                                  showRequiredField={false}
                                  showDefaultField={false}
                                  showAdvanced={true}
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
                          <TgVarFileList
                            formik={formik as FormikProps<TerragruntData>}
                            isReadonly={readonly}
                            allowableTypes={allowableTypes}
                            setSelectedConnector={setSelectedConnector}
                            getNewConnectorSteps={getNewConnectorSteps}
                            selectedConnector={selectedConnector}
                          />
                          <div className={css.divider} />
                          <>
                            <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
                              {formik.values?.spec?.configuration?.spec?.backendConfig?.type ===
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
                                  name="spec.configuration.spec.backendConfig.type"
                                  disabled={readonly}
                                  value={
                                    formik.values?.spec?.configuration?.spec?.backendConfig?.type ||
                                    BackendConfigurationTypes.Inline
                                  }
                                  onChange={e => {
                                    /* istanbul ignore next */
                                    onSelectChange(e, setFieldValue)
                                  }}
                                  data-testid="backendConfigurationOptions"
                                >
                                  <option value={BackendConfigurationTypes.Inline}>{getString('inline')}</option>
                                  <option value={BackendConfigurationTypes.Remote}>{getString('remote')}</option>
                                </select>
                              </div>
                            </Layout.Horizontal>
                            {formik.values?.spec?.configuration?.spec?.backendConfig?.type ===
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
                                        {backendConfigFilePath}
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
                              inlineBackendConfig(formik)
                            )}
                          </>

                          <div className={cx(stepCss.formGroup, css.addMarginTop, css.addMarginBottom)}>
                            <MultiTypeList
                              multiTextInputProps={{
                                expressions,
                                allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                                  item => !isMultiTypeRuntime(item)
                                ) as AllowedTypes
                              }}
                              name="spec.configuration.spec.targets"
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
                              name="spec.configuration.spec.environmentVariables"
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
                  </Accordion>

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
                      <div className={css.createTfWizard}>{newConfigFileComponent(formik, true, false)}</div>
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
                      <div className={css.createTfWizard}>{newConfigFileComponent(formik, false, true)}</div>
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
              )}
            </>
          )
        }}
      </Formik>
    </>
  )
}
