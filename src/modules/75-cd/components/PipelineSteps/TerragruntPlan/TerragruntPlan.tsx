/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Accordion,
  Button,
  ButtonVariation,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  HarnessDocTooltip,
  IconName,
  Icon,
  Label,
  Layout,
  MultiTypeInputType,
  Text,
  StepWizard
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Classes, Dialog, IOptionProps, IDialogProps } from '@blueprintjs/core'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { cloneDeep, isEmpty, set, unset, get } from 'lodash-es'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
// import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  setFormikRef,
  StepFormikFowardRef,
  StepViewType,
  ValidateInputSetProps
} from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { StringsMap } from 'stringTypes'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import StepArtifactoryAuthentication from '@connectors/components/CreateConnector/ArtifactoryConnector/StepAuth/StepArtifactoryAuthentication'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'

import { IdentifierSchemaWithOutName } from '@common/utils/Validation'

import { CommandTypes, TerraformPlanVariableStepProps } from '../Common/Terraform/TerraformInterfaces'

import { TFArtifactoryForm } from '../Common/Terraform/Editview/TerraformArtifactoryForm'
import { formatArtifactoryData } from '../Common/Terraform/Editview/TerraformArtifactoryFormHelper'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../Common/Terraform/Editview/TerraformVarfile.module.scss'
import {
  ConnectorMap,
  ConnectorTypes,
  getBuildPayload,
  getConfigFilePath,
  getPath
} from '../Common/ConfigFileStore/ConfigFileStoreHelper'
import { ConfigFileStoreStepTwo } from '../Common/ConfigFileStore/ConfigFileStoreStepTwo'
import { ConfigFileStoreStepOne } from '../Common/ConfigFileStore/ConfigFileStoreStepOne'
import type { TerragruntPlanProps, TGPlanFormData } from '../Common/Terragrunt/TerragruntInterface'
import TerragruntInputStep from '../Common/Terragrunt/TerragruntInputStep'
import { onSubmitTGPlanData } from '../Common/Terragrunt/TerragruntHelper'

const setInitialValues = (data: TGPlanFormData): TGPlanFormData => {
  return data
}
interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

function TerragruntPlanWidget(
  props: TerragruntPlanProps,
  formikRef: StepFormikFowardRef<TGPlanFormData>
): React.ReactElement {
  const { initialValues, onUpdate, onChange, allowableTypes, isNewStep, readonly = false, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [connectorView, setConnectorView] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState<ConnectorTypes | ''>('')

  const commandTypeOptions: IOptionProps[] = [
    { label: getString('filters.apply'), value: CommandTypes.Apply },
    { label: getString('pipelineSteps.destroy'), value: CommandTypes.Destroy }
  ]

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const query = useQueryParams()
  const sectionId = (query as any).sectionId || ''

  const [showRemoteWizard, setShowRemoteWizard] = useState(false)

  const [isEditMode, setIsEditMode] = useState(false)

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const onCloseOfRemoteWizard = () => {
    setConnectorView(false)
    setShowRemoteWizard(false)
    setIsEditMode(false)
  }

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 1) {
      setConnectorView(false)
    }
  }

  const getTitle = (): React.ReactElement => (
    <Layout.Vertical flex style={{ justifyContent: 'center', alignItems: 'center' }} margin={{ bottom: 'xlarge' }}>
      <Icon name="service-terragrunt" className={css.remoteIcon} size={50} padding={{ bottom: 'large' }} />
      <Text color={Color.WHITE}>{getString('cd.configFileStoreTitle')}</Text>
    </Layout.Vertical>
  )

  const newConfigFileComponent = (
    formik: any,
    isConfig: boolean,
    isBackendConfig: boolean,
    isTerraformPlan: boolean
  ) => {
    return (
      <StepWizard title={getTitle()} className={css.configWizard} onStepChange={onStepChange}>
        <ConfigFileStoreStepOne
          name={getString('cd.configFileStepOne')}
          data={formik.values}
          isBackendConfig={isBackendConfig}
          isReadonly={readonly}
          isEditMode={isEditMode}
          allowableTypes={allowableTypes}
          setConnectorView={setConnectorView}
          selectedConnector={selectedConnector}
          setSelectedConnector={setSelectedConnector}
        />
        {connectorView ? getNewConnectorSteps() : null}
        {
          /* istanbul ignore next */ selectedConnector === Connectors.ARTIFACTORY ? (
            <TFArtifactoryForm
              isConfig={isConfig}
              isTerraformPlan
              allowableTypes={allowableTypes}
              name={isBackendConfig ? getString('cd.backendConfigFileDetails') : getString('cd.configFileDetails')}
              onSubmitCallBack={(data: any, prevStepData: any) => {
                const path = getPath(isTerraformPlan, isBackendConfig)
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
                setShowRemoteWizard(false)
              }}
            />
          ) : (
            <ConfigFileStoreStepTwo
              name={getString('cd.configFileDetails')}
              isBackendConfig={isBackendConfig}
              isReadonly={readonly}
              allowableTypes={allowableTypes}
              onSubmitCallBack={(data: any, prevStepData: any) => {
                const path = getPath(isTerraformPlan, isBackendConfig)
                const configObject = get(data, path) || {
                  store: {}
                }
                if (data?.store?.type === 'Harness') {
                  configObject.store = data?.store
                } else {
                  configObject.moduleSource = isTerraformPlan
                    ? data.spec?.configuration?.configFiles?.moduleSource
                    : data.spec?.configuration?.spec?.configFiles?.moduleSource

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
                setShowRemoteWizard(false)
              }}
            />
          )
        }
      </StepWizard>
    )
  }

  return (
    <Formik<TGPlanFormData>
      onSubmit={values => {
        onUpdate?.(values)
      }}
      validate={values => {
        onChange?.(values)
      }}
      initialValues={setInitialValues(initialValues)}
      validationSchema={Yup.object().shape({
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
            command: Yup.string().required(getString('pipelineSteps.commandRequired')),
            secretManagerRef: Yup.string().required(getString('cd.secretManagerRequired')).nullable()
          })
        })
      })}
      formName={`terragruntPlanEditView-tgPlan-${sectionId}`}
    >
      {(formik: FormikProps<TGPlanFormData>) => {
        const { values, setFieldValue } = formik
        setFormikRef(formikRef, formik)
        const configFile = values?.spec?.configuration?.configFiles
        const configFilePath = getConfigFilePath(configFile)
        return (
          <>
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
                  multiTypeDurationProps={{ enableConfigureOptions: false, expressions, allowableTypes }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.timeout as string}
                    type="String"
                    variableName="step.timeout"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      /* istanbul ignore next */
                      setFieldValue('timeout', value)
                    }}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
                  />
                )}
              </div>

              <div className={css.divider} />

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.RadioGroup
                  name="spec.configuration.command"
                  label={getString('commandLabel')}
                  radioGroup={{ inline: true }}
                  items={commandTypeOptions}
                  className={css.radioBtns}
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
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                    showAdvanced={true}
                    onChange={
                      /* istanbul ignore next */ value => {
                        setFieldValue('spec.provisionerIdentifier', value)
                      }
                    }
                    isReadonly={readonly}
                  />
                )}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeConnectorField
                  label={getString('connectors.title.secretManager')}
                  category={'SECRET_MANAGER'}
                  setRefValue
                  width={280}
                  name="spec.configuration.secretManagerRef"
                  placeholder={getString('select')}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  style={{ marginBottom: 10 }}
                  multiTypeProps={{ expressions, allowableTypes }}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                  disabled={readonly}
                />
              </div>

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
                        onClick={() => setShowRemoteWizard(true)}
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
                        onClick={() => setShowRemoteWizard(true)}
                        data-name="config-edit"
                        withoutCurrentColor={true}
                        className={css.editBtn}
                      />
                    ) : null}
                  </div>
                </div>
              </Layout.Vertical>
            </>
            {showRemoteWizard && (
              <Dialog
                {...DIALOG_PROPS}
                isOpen={true}
                isCloseButtonShown
                onClose={() => {
                  setConnectorView(false)
                  setShowRemoteWizard(false)
                }}
                className={cx(css.modal, Classes.DIALOG)}
              >
                <div className={css.createTfWizard}>{newConfigFileComponent(formik, true, false, true)}</div>
                <Button
                  variation={ButtonVariation.ICON}
                  icon="cross"
                  iconProps={{ size: 18 }}
                  onClick={onCloseOfRemoteWizard}
                  data-testid={'close-wizard'}
                  className={css.crossIcon}
                />
              </Dialog>
            )}
          </>
        )
      }}
    </Formik>
  )
}
const TerragruntPlanWidgetWithRef = React.forwardRef(TerragruntPlanWidget)
export class TerragruntPlan extends PipelineStep<TGPlanFormData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerragruntPlan
  protected defaultValues: TGPlanFormData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.TerragruntPlan,
    spec: {
      configuration: {
        command: 'Apply',
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: 'Branch'
            }
          }
        },
        moduleConfig: {
          terragruntRunType: 'RunModule',
          path: ''
        },
        secretManagerRef: ''
      },
      provisionerIdentifier: ''
    }
  }
  protected stepIcon: IconName = 'terragrunt-plan'
  protected stepName = 'Terragrunt Plan'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TerraformPlan'
  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<TGPlanFormData>): FormikErrors<TGPlanFormData> {
    /* istanbul ignore next */
    const errors = {} as any
    /* istanbul ignore next */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    /* istanbul ignore next */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore next */
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })
      /* istanbul ignore next */
      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  private getInitialValues(data: TGPlanFormData): TGPlanFormData {
    return {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...data.spec?.configuration,
          secretManagerRef: data.spec?.configuration?.secretManagerRef || '',
          configFiles: data.spec?.configuration?.configFiles || ({} as any)
        }
      }
    }
  }

  processFormData(data: any): TGPlanFormData {
    return onSubmitTGPlanData(data)
  }

  renderStep(props: StepProps<TGPlanFormData, TerraformPlanVariableStepProps>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      customStepProps,
      formikRef,
      isNewStep
    } = props

    // if (this.isTemplatizedView(stepViewType)) {
    //   return (
    //     // <TerragruntInputStep
    //     //   initialValues={this.getInitialValues(initialValues)}
    //     //   onUpdate={data => onUpdate?.(this.processFormData(data))}
    //     //   onChange={data => onChange?.(this.processFormData(data))}
    //     //   allowableTypes={allowableTypes}
    //     //   stepViewType={stepViewType}
    //     //   allValues={inputSetData?.allValues}
    //     //   readonly={inputSetData?.readonly}
    //     //   inputSetData={inputSetData}
    //     //   path={inputSetData?.path}
    //     // />
    //   )
    // } else if (stepViewType === StepViewType.InputVariable) {
    //   return (
    //     // <TerraformVariableStep
    //     //   {...(customStepProps as TerraformPlanVariableStepProps)}
    //     //   initialValues={this.getInitialValues(initialValues)}
    //     //   onUpdate={(data: any) => onUpdate?.(this.processFormData(data))}
    //     // />
    //   )
    // }
    return (
      <TerragruntPlanWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        stepType={StepType.TerragruntPlan}
        readonly={props.readonly}
      />
    )
  }
}
