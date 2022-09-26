/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
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
import { useQueryParams } from '@common/hooks'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Connectors } from '@connectors/constants'
import { isValueRuntimeInput } from '@common/utils/utils'
import { ScriptWizard } from './ScriptWizard/ScriptWizard'
import { ScopeTypes, AzureBlueprintProps } from './AzureBlueprintTypes.types'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AzureBlueprint.module.scss'

export const AzureBlueprintRef = (
  { allowableTypes, isNewStep, readonly = false, initialValues, onUpdate, onChange, stepViewType }: AzureBlueprintProps,
  formikRef: StepFormikFowardRef
): JSX.Element => {
  const { getString } = useStrings()
  const query = useQueryParams()
  const sectionId = (query as any).sectionId || ''
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [showModal, setShowModal] = useState(false)
  const [connectorView, setConnectorView] = useState(false)

  /* istanbul ignore next */
  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
  }
  /* istanbul ignore next */
  const onClose = () => {
    setShowModal(false)
    setConnectorView(false)
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      formName={`azureBlueprint-${sectionId}`}
      validate={payload => {
        /* istanbul ignore next */
        onChange?.(payload)
      }}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={payload => {
        /* istanbul ignore next */
        onUpdate?.(payload)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            connectorRef: Yup.string().required(getString('pipelineSteps.build.create.connectorRequiredError')),
            assignmentName: Yup.string().required(getString('cd.azureBlueprint.assignmentNameError')),
            scope: Yup.string(),
            template: Yup.object()
              .shape({
                store: Yup.object({
                  type: Yup.string(),
                  spec: Yup.object().when('type', {
                    is: value => value !== 'Harness',
                    then: Yup.object().shape({
                      connectorRef: Yup.string().required(getString('cd.cloudFormation.errors.templateRequired'))
                    })
                  })
                })
              })
              .required()
          })
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        const { values, setFieldValue, errors } = formik
        const config = values.spec.configuration
        const templateType = config?.template?.store?.type
        let templatePath = config?.template?.store?.spec?.folderPath
        if (templateType === 'Harness') {
          templatePath = config?.template?.store?.spec?.files || config?.template?.store?.spec?.secretFiles
        }
        const templateError = get(errors, 'spec.configuration.template.store.spec.connectorRef')
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
              {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  value={values.timeout as string}
                  type="String"
                  variableName="step.timeout"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => {
                    setFieldValue('timeout', value)
                  }}
                  isReadonly={readonly}
                  allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
                />
              )}
            </div>
            <div className={css.divider} />
            <Label className={cx(stepCss.bottomMargin4, stepCss.topMargin4, css.azureBlueprintTitle)}>
              {getString('cd.azureBlueprint.configuration')}
            </Label>
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
              />
            </div>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.RadioGroup
                disabled={readonly}
                name="spec.configuration.scope"
                radioGroup={{ inline: true }}
                label="Scope"
                items={[
                  { label: getString('common.subscriptions.title'), value: ScopeTypes.Subscription },
                  { label: getString('cd.azureBlueprint.managementGroup'), value: ScopeTypes.ManagementGroup }
                ]}
              />
            </div>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTextInput
                disabled={readonly}
                name="spec.configuration.assignmentName"
                label={getString('cd.azureBlueprint.assignmentName')}
                multiTextInputProps={{ expressions }}
              />
              {
                /* istanbul ignore next */
                isValueRuntimeInput(values.spec?.configuration?.assignmentName) && (
                  <ConfigureOptions
                    value={values.spec?.configuration?.assignmentName as string}
                    type="String"
                    variableName="spec.configuration.assignmentName"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    /* istanbul ignore next */
                    onChange={value => {
                      setFieldValue('spec.configuration.assignmentName', value)
                    }}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                  />
                )
              }
            </div>
            <Layout.Vertical>
              <Label
                data-tooltip-id={'cloudFormationTemplate'}
                style={{ color: Color.GREY_900 }}
                className={css.templateLabel}
              >
                {getString('cd.azureBlueprint.azureBlueprintTemplate')}
              </Label>
            </Layout.Vertical>
            <Layout.Horizontal flex={{ alignItems: 'flex-start' }} className={cx(stepCss.formGroup, stepCss.lg)}>
              <div
                className={cx(css.center, css.scopeField, css.addMarginBottom)}
                onClick={() => {
                  /* istanbul ignore next */
                  setShowModal(true)
                }}
                data-testid="azureBlueprintFileStore"
              >
                <>
                  <a className={css.configPlaceHolder}>
                    {
                      /* istanbul ignore next */
                      getMultiTypeFromValue(templatePath) === MultiTypeInputType.RUNTIME
                        ? `/${templatePath}`
                        : templatePath
                        ? templatePath
                        : getString('cd.azureBlueprint.specifyTemplateFileSource')
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
            <ScriptWizard
              handleConnectorViewChange={handleConnectorViewChange}
              initialValues={values}
              expressions={expressions}
              allowableTypes={allowableTypes}
              newConnectorView={connectorView}
              isReadonly={readonly}
              isOpen={showModal}
              onClose={onClose}
              onSubmit={
                /* istanbul ignore next */ data => {
                  setFieldValue('spec.configuration.template.store', data?.store || data)
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
