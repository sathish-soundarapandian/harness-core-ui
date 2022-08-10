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
import { IdentifierSchemaWithOutName, ConnectorRefSchema } from '@common/utils/Validation'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Connectors } from '@connectors/constants'

import { ScriptWizard } from './ScriptWizard/ScriptWizard'
import { ScopeTypes, AzureBlueprintProps } from './AzureBluePrintTypes.types'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AzureBluePrint.module.scss'

export const AzureBlueprintRef = (
  { allowableTypes, isNewStep, readonly = false, initialValues, onUpdate, onChange, stepViewType }: AzureBlueprintProps,
  formikRef: StepFormikFowardRef
): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  /* istanbul ignore next */
  const [awsRef, setAwsRef] = useState(initialValues?.spec?.configuration?.connectorRef)
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
      formName={`azureBlueprint`}
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
                spec: Yup.object().shape({
                  connectorRef: Yup.string().required(getString('cd.cloudFormation.errors.templateRequired'))
                })
              })
            }),
            assignmentName: Yup.string().required(getString('cd.azureBluePrint.assignmentNameError')),
            scope: Yup.string()
          })
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        const { values, setFieldValue, errors } = formik
        const config = values.spec.configuration
        const templateType = config?.template?.store?.type
        const templatePath =
          templateType === 'Harness' ? config?.template?.store?.spec?.files : config?.template?.store?.spec?.paths
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
                  />
                )
              }
            </div>
            <Label className={cx(stepCss.bottomMargin4, stepCss.topMargin4, css.azureBlueprintTitle)}>
              Azure Blueprint Configuration
            </Label>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormMultiTypeConnectorField
                label={<Text color={Color.GREY_900}>{getString('pipelineSteps.awsConnectorLabel')}</Text>}
                type={Connectors.AWS}
                name="spec.configuration.connectorRef"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                style={{ marginBottom: 10 }}
                multiTypeProps={{ expressions, allowableTypes }}
                disabled={readonly}
                width={384}
                onChange={(value: any, _unused, _multiType) => {
                  /* istanbul ignore next */
                  const scope = value?.scope
                  let newConnectorRef: string
                  /* istanbul ignore next */
                  if (scope === 'org' || scope === 'account') {
                    newConnectorRef = `${scope}.${value?.record?.identifier}`
                  } else if (getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME) {
                    newConnectorRef = value
                  } else {
                    newConnectorRef = value?.record?.identifier
                  }
                  /* istanbul ignore next */
                  if (value?.record?.identifier !== awsRef) {
                    setAwsRef(newConnectorRef)
                  }
                  /* istanbul ignore next */
                  setFieldValue('spec.configuration.connectorRef', newConnectorRef)
                }}
              />
            </div>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.RadioGroup
                disabled={readonly}
                name="spec.configuration.scope"
                radioGroup={{ inline: true }}
                label="Scope"
                items={[
                  { label: 'Subscription', value: ScopeTypes.Subscription },
                  { label: 'Management Group', value: ScopeTypes.ManagementGroup }
                ]}
              />
            </div>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTextInput
                disabled={readonly}
                name="spec.configuration.assignmentName"
                label="Assignment Name"
              />
            </div>
            <Layout.Vertical>
              <Label
                data-tooltip-id={'cloudFormationTemplate'}
                style={{ color: Color.GREY_900 }}
                className={css.templateLabel}
              >
                {getString('cd.azureBluePrint.azureBlueprintTemplate')}
              </Label>
            </Layout.Vertical>
            <Layout.Horizontal flex={{ alignItems: 'flex-start' }} className={cx(stepCss.formGroup, stepCss.lg)}>
              <div
                className={cx(css.center, css.scopeField, css.addMarginBottom)}
                onClick={() => {
                  /* istanbul ignore next */
                  setShowModal(true)
                }}
                data-testid="azureTemplate"
              >
                <>
                  <a className={css.configPlaceHolder}>
                    {
                      /* istanbul ignore next */
                      getMultiTypeFromValue(templatePath) === MultiTypeInputType.RUNTIME
                        ? `/${templatePath}`
                        : templatePath?.[0]
                        ? templatePath?.[0]
                        : getString('cd.azureBluePrint.specifyTemplateFileSource')
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
                  setFieldValue('spec.configuration.template.store', data)
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
