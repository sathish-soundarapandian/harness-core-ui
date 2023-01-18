/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import {
  Text,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion,
  Container,
  FormInput,
  Layout,
  Label,
  Icon,
  AllowedTypes
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { getImagePullPolicyOptions, getShellOptions } from '@common/utils/ContainerRunStepUtils'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { Connectors } from '@connectors/constants'
import { useQueryParams } from '@common/hooks'
import { isMultiTypeRuntime } from '@common/utils/utils'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { ConnectorConfigureOptions } from '@connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import type { ContainerStepData, ContainerStepProps } from './types'
import { getValidationSchema, processInitialValues } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ContainerStep.module.scss'

export const ContainerStepBase = (
  props: ContainerStepProps,
  formikRef: StepFormikFowardRef<ContainerStepData>
): React.ReactElement => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { initialValues, onUpdate, isNewStep = true, readonly, onChange, allowableTypes, stepViewType } = props
  return (
    <Formik<ContainerStepData>
      onSubmit={(_values: ContainerStepData) => {
        onUpdate?.(_values)
      }}
      formName="ContainerStepEdit"
      initialValues={processInitialValues(initialValues)}
      validate={data => {
        onChange?.(data)
      }}
      validationSchema={getValidationSchema(getString, stepViewType)}
    >
      {(formik: FormikProps<ContainerStepData>) => {
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <NameTimeoutField
              allowableTypes={allowableTypes}
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
            />
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormMultiTypeConnectorField
                name="spec.connectorRef"
                label={getString('pipelineSteps.connectorLabel')}
                type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER, Connectors.AZURE]}
                placeholder={getString('select')}
                disabled={readonly}
                accountIdentifier={accountId}
                multiTypeProps={{ expressions, allowableTypes, disabled: readonly }}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                enableConfigureOptions={false}
                gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                width={372}
                setRefValue
              />
              {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                <ConnectorConfigureOptions
                  style={{ marginTop: 10 }}
                  value={formik.values.spec.connectorRef as string}
                  type="String"
                  variableName="spec.connectorRef"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => {
                    formik.setFieldValue('spec.connectorRef', value)
                  }}
                  isReadonly={readonly}
                  connectorReferenceFieldProps={{
                    accountIdentifier: accountId,
                    projectIdentifier,
                    orgIdentifier,
                    label: getString('connector'),
                    disabled: readonly,
                    gitScope: { repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }
                  }}
                />
              )}
            </div>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTextInput
                label={getString('imageLabel')}
                disabled={readonly}
                name="spec.image"
                multiTextInputProps={{ expressions, allowableTypes }}
                placeholder={getString('imagePlaceholder')}
              />
              {getMultiTypeFromValue(formik.values.spec.image) === MultiTypeInputType.RUNTIME && !readonly && (
                <ConfigureOptions
                  value={formik.values.spec.image as string}
                  type="String"
                  variableName="spec.image"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => {
                    formik.setFieldValue('spec.image', value)
                  }}
                  style={{ marginBottom: 5 }}
                  isReadonly={readonly}
                  allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                />
              )}
            </div>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name="spec.shell"
                label={getString('common.shell')}
                disabled={readonly}
                useValue
                multiTypeInputProps={{
                  selectProps: {
                    items: getShellOptions(getString)
                  },
                  expressions,
                  allowableTypes
                }}
                selectItems={getShellOptions(getString)}
              />
              {getMultiTypeFromValue(formik.values.spec.shell) === MultiTypeInputType.RUNTIME && !readonly && (
                <SelectConfigureOptions
                  options={getShellOptions(getString)}
                  value={formik.values.spec.shell as string}
                  type="String"
                  variableName="spec.shell"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => formik.setFieldValue('spec.shell', value)}
                  isReadonly={readonly}
                  style={{ marginBottom: 5 }}
                />
              )}
            </div>
            <div
              className={cx(stepCss.fieldsGroup, stepCss.withoutSpacing, stepCss.topPadding3, stepCss.bottomPadding3)}
            >
              <MultiTypeFieldSelector
                name="spec.command"
                label={getString('commandLabel')}
                defaultValueToReset=""
                skipRenderValueInExpressionLabel
                allowedTypes={allowableTypes}
                expressionRender={() => {
                  return (
                    <ShellScriptMonacoField
                      title={getString('commandLabel')}
                      name="spec.command"
                      scriptType="Bash"
                      expressions={expressions}
                      disabled={readonly}
                    />
                  )
                }}
                style={{ flexGrow: 1, marginBottom: 0 }}
                disableTypeSelection={readonly}
              >
                <ShellScriptMonacoField
                  title={getString('commandLabel')}
                  name="spec.command"
                  scriptType="Bash"
                  disabled={readonly}
                  expressions={expressions}
                />
              </MultiTypeFieldSelector>
              {getMultiTypeFromValue(formik?.values?.spec?.command) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  style={{ marginTop: 17 }}
                  value={formik.values.spec.command as string}
                  type={getString('string')}
                  variableName="spec.command"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => formik?.setFieldValue('spec.command', value)}
                  isReadonly={readonly}
                />
              )}
            </div>
            <Label className={css.infralabel}>{getString('infrastructureText')}</Label>
            <Container background={Color.WHITE} margin={{ bottom: 'medium' }}>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormMultiTypeConnectorField
                  name="spec.infrastructure.spec.connectorRef"
                  label={getString('connector')}
                  placeholder={getString('connectors.selectConnector')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  multiTypeProps={{ expressions, disabled: readonly, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={372}
                  enableConfigureOptions={false}
                  setRefValue
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.spec.infrastructure.spec.connectorRef) ===
                  MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConnectorConfigureOptions
                      style={{ marginTop: 10 }}
                      value={formik.values.spec.infrastructure.spec.connectorRef as string}
                      type={
                        <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                          <Icon name={getIconByType('K8sCluster')}></Icon>
                          <Text>{getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}</Text>
                        </Layout.Horizontal>
                      }
                      variableName="spec.infrastructure.spec.connectorRef"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('spec.infrastructure.spec.connectorRef', value)
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
                  style={{ width: '372px' }}
                  disabled={readonly}
                  label={getString('common.namespace')}
                  placeholder={getString('pipeline.infraSpecifications.namespacePlaceholder')}
                  multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                />
                {getMultiTypeFromValue(formik.values.spec.infrastructure.spec.namespace) ===
                  MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={formik.values.spec.infrastructure.spec.namespace as string}
                      type="String"
                      variableName="spec.infrastructure.spec.namespace"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('spec.infrastructure.spec.namespace', value)
                      }}
                      isReadonly={readonly}
                      allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                    />
                  )}
              </div>
              <Layout.Vertical className={stepCss.bottomMargin5} spacing="medium">
                <Text className={css.resourcesLabel} tooltipProps={{ dataTooltipId: 'setContainerResources' }}>
                  {getString('pipelineSteps.setContainerResources')}
                </Text>
                <Layout.Horizontal spacing="small">
                  <FormInput.MultiTextInput
                    name="spec.infrastructure.spec.resources.limits.memory"
                    label={getString('pipelineSteps.limitMemoryLabel')}
                    multiTextInputProps={{
                      expressions,
                      textProps: { disabled: readonly },
                      allowableTypes
                    }}
                    className={css.limitsInput}
                  />
                  {getMultiTypeFromValue(formik.values.spec.infrastructure.spec.resources.limits.memory) ===
                    MultiTypeInputType.RUNTIME &&
                    !readonly && (
                      <ConfigureOptions
                        style={{ marginTop: 18 }}
                        value={formik.values.spec.infrastructure.spec.resources.limits.memory as string}
                        type="String"
                        variableName="spec.infrastructure.spec.resources.limits.memory"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
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
                    className={css.limitsInput}
                  />
                  {getMultiTypeFromValue(formik.values.spec.infrastructure.spec.resources.limits.cpu) ===
                    MultiTypeInputType.RUNTIME &&
                    !readonly && (
                      <ConfigureOptions
                        style={{ marginTop: 18 }}
                        value={formik.values.spec.infrastructure.spec.resources.limits.cpu as string}
                        type="String"
                        variableName="spec.infrastructure.spec.resources.limits.cpu"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('spec.infrastructure.spec.resources.limits.cpu', value)
                        }}
                        isReadonly={readonly}
                      />
                    )}
                </Layout.Horizontal>
              </Layout.Vertical>
            </Container>
            <Accordion className={stepCss.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
                    <div className={cx(stepCss.formGroup, stepCss.lg)}>
                      <FormInput.MultiTypeInput
                        name="spec.imagePullPolicy"
                        label={getString('pipelineSteps.pullLabel')}
                        disabled={readonly}
                        useValue
                        multiTypeInputProps={{
                          selectProps: {
                            items: getImagePullPolicyOptions(getString),

                            addClearBtn: true
                          },
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                        }}
                        selectItems={getImagePullPolicyOptions(getString)}
                      />
                    </div>
                    <div className={cx(stepCss.formGroup, stepCss.lg)}>
                      <MultiTypeList
                        multiTextInputProps={{
                          expressions,
                          allowableTypes: (allowableTypes as MultiTypeInputType[]).filter(
                            item => !isMultiTypeRuntime(item)
                          ) as AllowedTypes
                        }}
                        name="spec.outputVariables"
                        disabled={readonly}
                        multiTypeFieldSelectorProps={{
                          label: getString('pipelineSteps.outputVariablesLabel')
                        }}
                        style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
                      />
                    </div>
                    <div className={cx(stepCss.formGroup, stepCss.lg)}>
                      <MultiTypeMap
                        name={'spec.envVariables'}
                        valueMultiTextInputProps={{
                          expressions,
                          allowableTypes
                        }}
                        multiTypeFieldSelectorProps={{
                          label: getString('environmentVariables'),
                          allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
                        }}
                        disabled={readonly}
                      />
                    </div>
                  </>
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const ContainerStepBaseWithRef = React.forwardRef(ContainerStepBase)
