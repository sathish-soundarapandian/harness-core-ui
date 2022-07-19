/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import {
  Button,
  Formik,
  Layout,
  Text,
  Heading,
  Card,
  Icon,
  ButtonVariation,
  ButtonSize,
  getMultiTypeFromValue,
  MultiTypeInputType,
  StepProps,
  AllowedTypes as MultiTypeAllowedTypes
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { Form } from 'formik'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { AllowedTypes, tfVarIcons, ConnectorMap, ConnectorLabelMap, ConnectorTypes } from './TerraformConfigFormHelper'

import css from './TerraformConfigForm.module.scss'

interface TerraformConfigStepOneProps {
  data: any
  isReadonly: boolean
  allowableTypes: MultiTypeAllowedTypes
  isEditMode: boolean
  selectedConnector: string
  setConnectorView: (val: boolean) => void
  setSelectedConnector: (val: ConnectorTypes) => void
  isTerraformPlan?: boolean
}

export const TerraformConfigStepOne: React.FC<StepProps<any> & TerraformConfigStepOneProps> = ({
  data,
  isReadonly,
  allowableTypes,
  nextStep,
  setConnectorView,
  selectedConnector,
  setSelectedConnector,
  isTerraformPlan = false
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  useEffect(() => {
    const selectedStore = isTerraformPlan
      ? data?.spec?.configuration?.configFiles?.store?.type
      : data?.spec?.configuration?.spec?.configFiles?.store?.type
    setSelectedConnector(selectedStore)
  }, [data, isTerraformPlan])

  const newConnectorLabel = `${getString('newLabel')} ${
    !!selectedConnector && getString(ConnectorLabelMap[selectedConnector as ConnectorTypes])
  } ${getString('connector')}`
  const connectorError = getString('pipelineSteps.build.create.connectorRequiredError')
  const configSchema = {
    configFiles: Yup.object().shape({
      store: Yup.object().shape({
        spec: Yup.object().shape({
          connectorRef: Yup.string().required(connectorError)
        })
      })
    })
  }
  const validationSchema = isTerraformPlan
    ? Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            ...configSchema
          })
        })
      })
    : Yup.object().shape({
        spec: Yup.object().shape({
          configuration: Yup.object().shape({
            spec: Yup.object().shape({
              ...configSchema
            })
          })
        })
      })

  return (
    <Layout.Vertical padding="small" className={css.tfConfigForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {getString('cd.configFileStore')}
      </Heading>
      <Formik
        formName="tfPlanConfigForm"
        enableReinitialize={true}
        onSubmit={values => {
          /* istanbul ignore next */
          nextStep?.({ formValues: values, selectedType: selectedConnector })
        }}
        initialValues={data}
        validationSchema={validationSchema}
      >
        {formik => {
          const config = formik?.values?.spec?.configuration
          const connectorRef = isTerraformPlan
            ? config?.configFiles?.store?.spec?.connectorRef
            : config?.spec?.configFiles?.store?.spec?.connectorRef
          const isFixedValue = getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED
          const disabled = !selectedConnector || (isFixedValue && !(connectorRef as ConnectorSelectedValue)?.connector)
          return (
            <>
              <Layout.Horizontal className={css.horizontalFlex} margin={{ top: 'xlarge', bottom: 'xlarge' }}>
                {AllowedTypes.map(item => (
                  <div key={item} className={css.squareCardContainer}>
                    <Card
                      className={css.connectorIcon}
                      selected={item === selectedConnector}
                      data-testid={`varStore-${item}`}
                      onClick={() => {
                        setSelectedConnector(item as ConnectorTypes)
                        if (isFixedValue) {
                          formik?.setFieldValue(
                            isTerraformPlan
                              ? 'spec.configuration.configFiles.store.spec.connectorRef'
                              : 'spec.configuration.spec.configFiles.store.spec.connectorRef',
                            ''
                          )
                        }
                      }}
                    >
                      <Icon name={tfVarIcons[item]} size={26} />
                    </Card>
                    <Text color={Color.BLACK_100}>{item}</Text>
                  </div>
                ))}
              </Layout.Horizontal>
              <Form className={css.formComponent}>
                <div className={css.formContainerStepOne}>
                  {selectedConnector && (
                    <Layout.Horizontal className={css.horizontalFlex} spacing={'medium'}>
                      <FormMultiTypeConnectorField
                        label={
                          <Text style={{ display: 'flex', alignItems: 'center' }}>
                            {ConnectorMap[selectedConnector]} {getString('connector')}
                            <Button
                              icon="question"
                              minimal
                              tooltip={`${ConnectorMap[selectedConnector]} ${getString('connector')}`}
                              iconProps={{ size: 14 }}
                            />
                          </Text>
                        }
                        type={ConnectorMap[selectedConnector]}
                        width={400}
                        name={
                          isTerraformPlan
                            ? 'spec.configuration.configFiles.store.spec.connectorRef'
                            : 'spec.configuration.spec.configFiles.store.spec.connectorRef'
                        }
                        placeholder={getString('select')}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        style={{ marginBottom: 10 }}
                        multiTypeProps={{ expressions, allowableTypes }}
                      />
                      <Button
                        className={css.newConnectorButton}
                        variation={ButtonVariation.LINK}
                        size={ButtonSize.SMALL}
                        disabled={isReadonly}
                        id="new-config-connector"
                        text={newConnectorLabel}
                        icon="plus"
                        iconProps={{ size: 12 }}
                        onClick={() => {
                          /* istanbul ignore next */
                          setConnectorView(true)
                          /* istanbul ignore next */
                          nextStep?.({ formValues: data, selectedType: selectedConnector })
                        }}
                      />
                    </Layout.Horizontal>
                  )}
                </div>
                <Layout.Horizontal spacing="xxlarge">
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    disabled={disabled}
                  />
                </Layout.Horizontal>
              </Form>
            </>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
