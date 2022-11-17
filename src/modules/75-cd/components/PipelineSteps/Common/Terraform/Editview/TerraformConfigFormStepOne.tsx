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
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { Form } from 'formik'
import { get } from 'lodash-es'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  AllowedTypes,
  tfVarIcons,
  ConnectorMap,
  ConnectorLabelMap,
  ConnectorTypes,
  getPath
} from './TerraformConfigFormHelper'

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
  isBackendConfig?: boolean
}

export const TerraformConfigStepOne: React.FC<StepProps<any> & TerraformConfigStepOneProps> = ({
  data,
  isReadonly,
  allowableTypes,
  nextStep,
  setConnectorView,
  selectedConnector,
  setSelectedConnector,
  isTerraformPlan = false,
  isBackendConfig = false
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const storeTypes = isBackendConfig ? [...AllowedTypes, 'Harness'] : AllowedTypes
  const path = getPath(isTerraformPlan, isBackendConfig)

  useEffect(() => {
    let selectedStore: ConnectorTypes
    if (isBackendConfig) {
      selectedStore = isTerraformPlan
        ? data?.spec?.configuration?.backendConfig?.spec?.store?.type
        : data?.spec?.configuration?.spec?.backendConfig?.spec?.store?.type
    } else {
      selectedStore = isTerraformPlan
        ? data?.spec?.configuration?.configFiles?.store?.type
        : data?.spec?.configuration?.spec?.configFiles?.store?.type
    }

    selectedStore && setSelectedConnector(selectedStore)
  }, [data, isTerraformPlan, isBackendConfig, setSelectedConnector])

  const isHarness = (store?: string): boolean => {
    return store === 'Harness'
  }

  const newConnectorLabel = `${getString('newLabel')} ${
    !!selectedConnector &&
    !isHarness(selectedConnector) &&
    getString(ConnectorLabelMap[selectedConnector as ConnectorTypes])
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

  const backendConfigSchema = {
    backendConfig: Yup.object().shape({
      spec: Yup.object().shape({
        store: Yup.object().shape({
          spec: Yup.object().shape({
            connectorRef: Yup.string().required(connectorError)
          })
        })
      })
    })
  }

  const getValidationSchema = (isBeConfig: boolean, isTfPlan: boolean): Yup.ObjectSchema | void => {
    if (isHarness(selectedConnector)) {
      return
    }
    if (isBeConfig) {
      return isTfPlan
        ? Yup.object().shape({
            spec: Yup.object().shape({
              configuration: Yup.object().shape({
                ...backendConfigSchema
              })
            })
          })
        : Yup.object().shape({
            spec: Yup.object().shape({
              configuration: Yup.object().shape({
                spec: Yup.object().shape({
                  ...backendConfigSchema
                })
              })
            })
          })
    } else {
      return isTfPlan
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
    }
  }

  return (
    <Layout.Vertical className={css.tfConfigForm}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'xlarge' }}>
        {isBackendConfig ? getString('cd.backendConfigFileStore') : getString('cd.configFileStore')}
      </Heading>
      <Formik
        formName={isBackendConfig ? 'tfPlanBackendConfigForm' : 'tfPlanConfigForm'}
        enableReinitialize={true}
        onSubmit={values => {
          /* istanbul ignore next */
          nextStep?.({ formValues: values, selectedType: selectedConnector })
        }}
        initialValues={data}
        validationSchema={getValidationSchema(isBackendConfig, isTerraformPlan)}
      >
        {formik => {
          const connectorRef = get(formik?.values, `${path}.store.spec.connectorRef`)
          const isFixedValue = getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED
          const disabled =
            !isHarness(selectedConnector) &&
            (!selectedConnector || (isFixedValue && !(connectorRef as ConnectorSelectedValue)?.connector))
          return (
            <>
              <Layout.Horizontal className={css.horizontalFlex} margin={{ top: 'xlarge', bottom: 'xlarge' }}>
                {storeTypes.map(item => (
                  <div key={item} className={css.squareCardContainer}>
                    <Card
                      className={css.connectorIcon}
                      selected={item === selectedConnector}
                      data-testid={`varStore-${item}`}
                      onClick={() => {
                        setSelectedConnector(item as ConnectorTypes)
                        if (isFixedValue) {
                          formik?.setFieldValue(`${path}.store.spec.connectorRef`, '')
                        }
                      }}
                    >
                      <Icon name={tfVarIcons[item]} size={26} />
                    </Card>
                    <Text color={Color.BLACK_100}>{item}</Text>
                  </div>
                ))}
              </Layout.Horizontal>
              <Form>
                <div className={css.formContainerStepOne}>
                  {selectedConnector && !isHarness(selectedConnector) && (
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
                        name={`${path}.store.spec.connectorRef`}
                        placeholder={getString('select')}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        style={{ marginBottom: 10 }}
                        multiTypeProps={{ expressions, allowableTypes }}
                      />
                      {getMultiTypeFromValue(get(formik.values, `${path}.store.spec.connectorRef`)) !==
                      MultiTypeInputType.RUNTIME ? (
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
                      ) : null}
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
