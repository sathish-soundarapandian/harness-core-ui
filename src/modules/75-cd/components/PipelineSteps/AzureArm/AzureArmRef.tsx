/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { get, omit } from 'lodash-es'
import cx from 'classnames'
import * as Yup from 'yup'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  Color,
  Layout,
  Button,
  Label
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { IdentifierSchemaWithOutName, ConnectorRefSchema } from '@common/utils/Validation'
import { ConfigureOptions, ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Connectors } from '@connectors/constants'

import { Scopes } from './Scopes'
import { ScriptWizard } from './ScriptWizard/ScriptWizard'
import { AzureArmProps, ScopeTypes } from './AzureArm.types'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AzureArm.module.scss'

export const AzureArmRef = (
  { allowableTypes, isNewStep, readonly = false, initialValues, onUpdate, onChange, stepViewType }: AzureArmProps,
  formikRef: StepFormikFowardRef
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [isParam, setIsParam] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [connectorView, setConnectorView] = useState(false)

  /* istanbul ignore next */
  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
  }
  /* istanbul ignore next */
  const onClose = (): void => {
    setIsParam(false)
    setShowModal(false)
    setConnectorView(false)
  }

  const getValidationSchema = (): Yup.ObjectSchema => {
    return Yup.object().shape({
      ...getNameAndIdentifierSchema(getString, stepViewType),
      timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
      spec: Yup.object().shape({
        provisionerIdentifier: Yup.lazy((value): Yup.Schema<unknown> => {
          /* istanbul ignore next */
          if (getMultiTypeFromValue(value as string) === MultiTypeInputType.FIXED) {
            return IdentifierSchemaWithOutName(getString, {
              requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
              regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
            })
          }
          /* istanbul ignore next */
          return Yup.string().required(getString('common.validation.provisionerIdentifierIsRequired'))
        }),
        configuration: Yup.object().shape({
          connectorRef: ConnectorRefSchema(),
          template: Yup.object().shape({
            store: Yup.object({
              type: Yup.string(),
              spec: Yup.object().when('type', {
                is: val => val !== 'Harness',
                then: Yup.object().shape({
                  connectorRef: Yup.string().required(getString('cd.cloudFormation.errors.templateRequired'))
                })
              })
            })
          }),
          scope: Yup.object().shape({
            type: Yup.string(),
            spec: Yup.object()
              .when('type', {
                is: val => val === ScopeTypes.ResourceGroup,
                then: Yup.object().shape({
                  subscription: Yup.string().required(
                    getString('cd.azureArm.required', { name: getString('common.plans.subscription') })
                  ),
                  resourceGroup: Yup.string().required(
                    getString('cd.azureArm.required', { name: getString('common.resourceGroupLabel') })
                  ),
                  mode: Yup.string().required(getString('cd.azureArm.required', { name: 'Mode' }))
                })
              })
              .when('type', {
                is: val => val === ScopeTypes.ManagementGroup,
                then: Yup.object().shape({
                  managementGroupId: Yup.string().required(
                    getString('cd.azureArm.required', { name: getString('cd.azureArm.managementGroup') })
                  ),
                  location: Yup.string().required(
                    getString('cd.azureArm.required', { name: getString('cd.azureArm.location') })
                  )
                })
              })
              .when('type', {
                is: val => val === ScopeTypes.Tenant,
                then: Yup.object().shape({
                  location: Yup.string().required(
                    getString('cd.azureArm.required', { name: getString('cd.azureArm.location') })
                  )
                })
              })
              .when('type', {
                is: val => val === ScopeTypes.Subscription,
                then: Yup.object().shape({
                  subscription: Yup.string().required(
                    getString('cd.azureArm.required', { name: getString('common.plans.subscription') })
                  ),
                  location: Yup.string().required(
                    getString('cd.azureArm.required', { name: getString('cd.azureArm.location') })
                  )
                })
              })
          })
        })
      })
    })
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      formName={`azureArm`}
      validate={data => {
        /* istanbul ignore next */
        onChange?.(data)
      }}
      onSubmit={data => {
        /* istanbul ignore next */
        onUpdate?.(data)
      }}
      validationSchema={getValidationSchema()}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        const { values, setFieldValue, errors } = formik
        const config = values.spec.configuration
        const connectorRef = config?.connectorRef
        const templateType = config?.template?.store?.type
        let templatePath = config?.template?.store?.spec?.paths
        if (templateType === 'Harness') {
          templatePath = config?.template?.store?.spec?.files || config?.template?.store?.spec?.secretFiles
        }
        const paramType = config?.parameters?.store?.type
        let paramPath = config?.parameters?.store?.spec?.paths
        if (paramType === 'Harness') {
          paramPath = config?.parameters?.store?.spec?.files || config?.parameters?.store?.spec?.secretFiles
        }
        const configScope = config?.scope
        const templateError = get(errors, 'spec.configuration.templateFile.store.spec.connectorRef')
        return (
          <>
            {stepViewType !== StepViewType.Template && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{
                    disabled: readonly
                  }}
                />
              </div>
            )}
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormMultiTypeDurationField
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                multiTypeDurationProps={{ enableConfigureOptions: false, expressions, allowableTypes }}
                disabled={readonly}
              />
              {getMultiTypeFromValue(values?.timeout) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={values?.timeout as string}
                  type="String"
                  variableName="step.timeout"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={
                    /* istanbul ignore next */ value => {
                      setFieldValue('timeout', value)
                    }
                  }
                  isReadonly={readonly}
                  allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
                />
              )}
            </div>
            <div className={css.divider} />
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTextInput
                name="spec.provisionerIdentifier"
                label={getString('pipelineSteps.provisionerIdentifier')}
                multiTextInputProps={{ expressions, allowableTypes }}
                disabled={readonly}
              />
              {
                /* istanbul ignore next */
                getMultiTypeFromValue(values.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.spec?.provisionerIdentifier as string}
                    type="String"
                    variableName="spec.provisionerIdentifier"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    /* istanbul ignore next */
                    onChange={value => {
                      setFieldValue('spec.provisionerIdentifier', value)
                    }}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                  />
                )
              }
            </div>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormMultiTypeConnectorField
                label={<Text color={Color.GREY_900}>{getString('common.azureConnector')}</Text>}
                type={Connectors.AZURE}
                name="spec.configuration.connectorRef"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                style={{ marginBottom: 10 }}
                multiTypeProps={{ expressions, allowableTypes }}
                disabled={readonly}
                width={384}
                setRefValue
                configureOptionsProps={{ className: css.connectorConfigOptions }}
              />
            </div>
            <Layout.Vertical>
              <Label
                data-tooltip-id={'cloudFormationTemplate'}
                style={{ color: Color.GREY_900 }}
                className={css.templateLabel}
              >
                {getString('cd.azureArm.templateFile')}
              </Label>
            </Layout.Vertical>
            <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
              <div
                className={cx(css.scopeField, css.addMarginBottom)}
                onClick={() => {
                  /* istanbul ignore next */
                  setShowModal(true)
                }}
                data-testid="azureTemplate"
              >
                <>
                  <a className={cx(css.fullWidth, css.configPlaceHolder)}>
                    {
                      /* istanbul ignore next */
                      getMultiTypeFromValue(templatePath) === MultiTypeInputType.RUNTIME
                        ? `/${templatePath}`
                        : templatePath?.[0]
                        ? templatePath?.[0]
                        : getString('cd.azureArm.specifyTemplateFile')
                    }
                  </a>
                  <Button
                    minimal
                    icon="Edit"
                    withoutBoxShadow
                    iconProps={{ size: 16 }}
                    data-name="config-edit"
                    withoutCurrentColor={true}
                  />
                </>
              </div>
            </Layout.Horizontal>
            {templateError && (
              <Text
                icon="circle-cross"
                iconProps={{ size: 12 }}
                className={cx(css.formikError, css.addMarginTop, css.addMarginBottom)}
                intent="danger"
              >
                {templateError}
              </Text>
            )}
            <Layout.Vertical>
              <Label
                data-tooltip-id={'cloudFormationTemplate'}
                style={{ color: Color.GREY_900 }}
                className={css.templateLabel}
              >
                {getString('optionalField', { name: getString('cd.azureArm.paramFile') })}
              </Label>
            </Layout.Vertical>
            <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
              <div className={cx(css.scopeField, css.addMarginBottom)}>
                <>
                  <a
                    className={cx(css.configPlaceHolder, css.fullWidth)}
                    onClick={
                      /* istanbul ignore next */
                      () => {
                        setIsParam(true)
                        setShowModal(true)
                      }
                    }
                    data-testid="azureTemplate"
                  >
                    {
                      /* istanbul ignore next */
                      getMultiTypeFromValue(paramPath) === MultiTypeInputType.RUNTIME
                        ? `/${paramPath}`
                        : paramPath?.[0]
                        ? paramPath?.[0]
                        : getString('cd.azureArm.specifyParameterFile')
                    }
                  </a>
                  <>
                    {paramType && (
                      <Button
                        onClick={() => setFieldValue('spec.configuration', omit(config, 'parameters'))}
                        minimal
                        icon="cross"
                        withoutBoxShadow
                        iconProps={{ size: 16 }}
                        withoutCurrentColor={true}
                      />
                    )}
                    <Button
                      minimal
                      icon="Edit"
                      withoutBoxShadow
                      iconProps={{ size: 16 }}
                      data-name="config-edit"
                      withoutCurrentColor={true}
                      onClick={
                        /* istanbul ignore next */
                        () => {
                          setIsParam(true)
                          setShowModal(true)
                        }
                      }
                    />
                  </>
                </>
              </div>
            </Layout.Horizontal>
            <Scopes
              formik={formik}
              scope={configScope}
              readonly={readonly}
              allowableTypes={allowableTypes}
              expressions={expressions}
              connectorRef={connectorRef}
            />
            <ScriptWizard
              handleConnectorViewChange={handleConnectorViewChange}
              initialValues={values}
              expressions={expressions}
              allowableTypes={allowableTypes}
              newConnectorView={connectorView}
              isReadonly={readonly}
              isOpen={showModal}
              isParam={isParam}
              onClose={onClose}
              onSubmit={
                /* istanbul ignore next */
                data => {
                  let fieldName = 'spec.configuration.template.store'
                  if (isParam) {
                    fieldName = 'spec.configuration.parameters.store'
                  }
                  setFieldValue(fieldName, data?.store || data)
                  onClose()
                }
              }
            />
          </>
        )
      }}
    </Formik>
  )
}
