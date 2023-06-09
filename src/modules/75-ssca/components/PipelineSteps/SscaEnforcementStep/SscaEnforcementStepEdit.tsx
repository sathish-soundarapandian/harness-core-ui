/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import {
  Accordion,
  FormInput,
  Formik,
  FormikForm,
  Icon,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text,
  getMultiTypeFromValue
} from '@harness/uicore'
import type { FormikProps } from 'formik'
import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { Connectors } from '@connectors/constants'
import FileStoreSelectField from '@filestore/components/MultiTypeFileSelect/FileStoreSelect/FileStoreSelectField'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import {
  getFormValuesInCorrectFormat,
  getInitialValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGitScope } from '@pipeline/utils/CIUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { useStrings } from 'framework/strings'
import type { SbomSource } from 'services/ci'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/constants'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { editViewValidateFieldsConfig, transformValuesFieldsConfig } from './SscaEnforcementStepFunctionConfigs'
import type {
  SscaEnforcementStepData,
  SscaEnforcementStepDataUI,
  SscaEnforcementStepProps
} from './SscaEnforcementStep'
import { AllMultiTypeInputTypesForStep } from '../utils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './SscaEnforcementStep.module.scss'

const getTypedOptions = <T extends string>(input: T[]): SelectOption[] => {
  return input.map(item => ({ label: item, value: item }))
}

const artifactTypeOptions = getTypedOptions<SbomSource['type']>(['image'])

const SscaEnforcementStepEdit = (
  {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    stepViewType,
    onChange,
    allowableTypes,
    stepType
  }: SscaEnforcementStepProps,
  formikRef: StepFormikFowardRef<SscaEnforcementStepData>
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { getStageFromPipeline, state } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(
    state.selectionState.selectedStageId || ''
  )
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const gitScope = useGitScope()

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<SscaEnforcementStepData, SscaEnforcementStepDataUI>(
        initialValues,
        transformValuesFieldsConfig(stepType)
      )}
      formName="SscaEnforcementStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<SscaEnforcementStepDataUI, SscaEnforcementStepData>(
          valuesToValidate,
          transformValuesFieldsConfig(stepType)
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig(stepType),
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: SscaEnforcementStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<SscaEnforcementStepDataUI, SscaEnforcementStepData>(
          _values,
          transformValuesFieldsConfig(stepType)
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<SscaEnforcementStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <div className={css.stepContainer}>
              {stepViewType !== StepViewType.Template && (
                <FormInput.InputWithIdentifier
                  inputName="name"
                  idName="identifier"
                  inputLabel={getString('pipelineSteps.stepNameLabel')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{ disabled: readonly }}
                />
              )}

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.orchestrationStep.artifactSource')}
              </Text>

              <FormInput.Select
                items={artifactTypeOptions}
                name="spec.source.type"
                label={getString('pipeline.artifactsSelection.artifactType')}
                placeholder={getString('select')}
                disabled={readonly}
              />

              <FormMultiTypeConnectorField
                label={getString('pipelineSteps.connectorLabel')}
                type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER, Connectors.AZURE]}
                name="spec.source.spec.connector"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                multiTypeProps={{
                  expressions,
                  allowableTypes: AllMultiTypeInputTypesForStep,
                  disabled: readonly
                }}
                gitScope={gitScope}
                setRefValue
                configureOptionsProps={{
                  hideExecutionTimeField: true
                }}
              />

              <MultiTypeTextField
                name="spec.source.spec.image"
                label={
                  <Text
                    className={css.formLabel}
                    tooltipProps={{ dataTooltipId: 'image' }}
                    placeholder={getString('imagePlaceholder')}
                  >
                    {getString('image')}
                  </Text>
                }
                multiTextInputProps={{
                  disabled: readonly,
                  multiTextInputProps: {
                    allowableTypes: AllMultiTypeInputTypesForStep
                  }
                }}
                configureOptionsProps={{
                  hideExecutionTimeField: true
                }}
              />

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.enforcementStep.verifyAttestation')}
              </Text>

              <MultiTypeSecretInput
                type="SecretFile"
                name="spec.verifyAttestation.spec.publicKey"
                label={getString('ssca.publicKey')}
                expressions={expressions}
                disabled={readonly}
              />

              <Text
                font={{ variation: FontVariation.FORM_SUB_SECTION }}
                color={Color.GREY_900}
                margin={{ top: 'medium' }}
              >
                {getString('ssca.enforcementStep.policyConfiguration')}
              </Text>

              <FileStoreSelectField
                label={getString('common.git.filePath')}
                name="spec.policy.store.spec.file"
                onChange={newValue => {
                  formik?.setFieldValue('spec.policy.store.spec.file', newValue)
                }}
                fileUsage={FileUsage.MANIFEST_FILE}
              />

              {stepType === StepType.CdSscaEnforcement ? (
                <>
                  <Text
                    font={{ variation: FontVariation.FORM_SUB_SECTION }}
                    color={Color.GREY_900}
                    margin={{ top: 'medium' }}
                  >
                    {getString('infrastructureText')}
                  </Text>

                  <div className={cx(stepCss.formGroup, stepCss.lg)}>
                    <FormMultiTypeConnectorField
                      name="spec.infrastructure.spec.connectorRef"
                      label={getString('connector')}
                      placeholder={getString('common.entityPlaceholderText')}
                      disabled={readonly}
                      accountIdentifier={accountId}
                      multiTypeProps={{ expressions, disabled: readonly, allowableTypes }}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      enableConfigureOptions={false}
                      setRefValue
                      gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    />
                    {getMultiTypeFromValue(formik.values.spec.infrastructure?.spec.connectorRef) ===
                      MultiTypeInputType.RUNTIME &&
                      !readonly && (
                        <ConnectorConfigureOptions
                          style={{ marginTop: 10 }}
                          value={formik.values.spec.infrastructure?.spec.connectorRef as string}
                          type={
                            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                              <Icon name={getIconByType('K8sCluster')}></Icon>
                              <Text>{getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}</Text>
                            </Layout.Horizontal>
                          }
                          variableName="spec.infrastructure.spec.connector"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('spec.infrastructure.spec.connector', value)
                          }}
                          isReadonly={readonly}
                          connectorReferenceFieldProps={{
                            accountIdentifier: accountId,
                            projectIdentifier,
                            orgIdentifier,
                            label: getString('connector'),
                            disabled: readonly,
                            gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true },
                            tooltipProps: {
                              dataTooltipId: 'k8InfraConnector'
                            }
                          }}
                        />
                      )}
                  </div>
                  <div className={cx(stepCss.formGroup, stepCss.lg)}>
                    <FormInput.MultiTextInput
                      name="spec.infrastructure.spec.namespace"
                      style={{ width: '400px' }}
                      disabled={readonly}
                      label={getString('common.namespace')}
                      placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
                      multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values.spec.infrastructure?.spec.namespace) ===
                      MultiTypeInputType.RUNTIME &&
                      !readonly && (
                        <ConfigureOptions
                          value={formik.values.spec.infrastructure?.spec.namespace as string}
                          type="String"
                          variableName="spec.infrastructure.spec.namespace"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('spec.infrastructure.spec.namespace', value)
                          }}
                          isReadonly={readonly}
                          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                        />
                      )}
                  </div>

                  <Layout.Horizontal spacing="small">
                    <FormInput.MultiTextInput
                      name="spec.infrastructure.spec.resources.limits.memory"
                      label={getString('pipelineSteps.limitMemoryLabel')}
                      multiTextInputProps={{
                        expressions,
                        textProps: { disabled: readonly },
                        allowableTypes
                      }}
                      tooltipProps={{ dataTooltipId: 'setContainerResources' }}
                    />
                    {getMultiTypeFromValue(formik.values.spec.infrastructure?.spec.resources.limits.memory) ===
                      MultiTypeInputType.RUNTIME &&
                      !readonly && (
                        <ConfigureOptions
                          style={{ marginTop: 18 }}
                          value={formik.values.spec.infrastructure?.spec.resources.limits.memory as string}
                          type="String"
                          variableName="spec.infrastructure.spec.resources.limits.memory"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('spec.infrastructure.spec.resources.limits.memory', value)
                          }}
                          isReadonly={readonly}
                        />
                      )}
                    <FormInput.MultiTextInput
                      name="spec.infrastructure.spec.resources.limits.cpu"
                      label={getString('pipelineSteps.limitCPULabel')}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes,
                        disabled: readonly
                      }}
                      tooltipProps={{ dataTooltipId: 'setContainerResources' }}
                    />
                    {getMultiTypeFromValue(formik.values.spec.infrastructure?.spec.resources.limits.cpu) ===
                      MultiTypeInputType.RUNTIME &&
                      !readonly && (
                        <ConfigureOptions
                          style={{ marginTop: 18 }}
                          value={formik.values.spec.infrastructure?.spec.resources.limits.cpu as string}
                          type="String"
                          variableName="spec.infrastructure.spec.resources.limits.cpu"
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={value => {
                            formik.setFieldValue('spec.infrastructure.spec.resources.limits.cpu', value)
                          }}
                          isReadonly={readonly}
                        />
                      )}
                  </Layout.Horizontal>
                </>
              ) : null}

              <Accordion>
                <Accordion.Panel
                  id="optional-config"
                  summary={getString('common.optionalConfig')}
                  details={
                    <FormMultiTypeDurationField
                      name="timeout"
                      label={getString('pipelineSteps.timeoutLabel')}
                      multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
                      disabled={readonly}
                    />
                  }
                />
              </Accordion>
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const SscaEnforcementStepEditWithRef = React.forwardRef(SscaEnforcementStepEdit)
