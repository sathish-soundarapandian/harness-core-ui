/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'

import {
  Button,
  ButtonVariation,
  Card,
  Formik,
  Heading,
  Icon,
  Layout,
  MultiTypeInputType,
  getMultiTypeFromValue,
  StepProps,
  Text,
  ButtonSize,
  AllowedTypes as MultiTypeAllowedTypes
} from '@harness/uicore'
import { Form } from 'formik'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConnectorRefSchema } from '@common/utils/Validation'
import {
  AllowedTypes,
  ConnectorLabelMap,
  ConnectorMap,
  ConnectorTypes,
  tfVarIcons
} from '../../ConfigFileStore/ConfigFileStoreHelper'
import css from './TerraformVarfile.module.scss'

interface TFVarStoreProps {
  initialValues: any
  isEditMode: boolean
  allowableTypes: MultiTypeAllowedTypes
  handleConnectorViewChange?: () => void
  isReadonly?: boolean
  setConnectorView?: (val: boolean) => void
  setSelectedConnector: (val: string) => void
}

export const TFVarStore: React.FC<StepProps<any> & TFVarStoreProps> = ({
  prevStepData,
  nextStep,
  initialValues,
  isEditMode,
  allowableTypes,
  handleConnectorViewChange,
  isReadonly,
  setConnectorView,
  setSelectedConnector
}) => {
  const [selectedType, setSelectedType] = React.useState('')
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { expressions } = useVariablesExpression()
  const iValues = {
    varFile: {
      store: {
        spec: {
          connectorRef: ''
        }
      }
    }
  }
  React.useEffect(() => {
    /* istanbul ignore next */
    setSelectedType(initialValues?.varFile?.spec?.store?.type)
    setSelectedConnector(initialValues?.varFile?.spec?.store?.type)
    if (setConnectorView) {
      setConnectorView(false)
    }
  }, [])

  const newConnectorLabel = `${getString('newLabel')} ${
    !!selectedType && getString(ConnectorLabelMap[selectedType as ConnectorTypes])
  } ${getString('connector')}`

  return (
    <Layout.Vertical padding="small" className={css.tfVarStore}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24, fontWeight: 'bold' }} margin={{ bottom: 'large' }}>
        {getString('cd.specifyTfVarStore')}
      </Heading>

      <Formik
        formName="tfVarStoreForm"
        initialValues={isEditMode ? initialValues : iValues}
        enableReinitialize={true}
        onSubmit={() => {
          /* istanbul ignore next */
          setSelectedType('')
        }}
        validationSchema={Yup.object().shape({
          varFile: Yup.object().shape({
            store: Yup.object().shape({
              spec: Yup.object().shape({
                connectorRef: ConnectorRefSchema(getString)
              })
            })
          })
        })}
      >
        {formik => {
          const connectorRef = formik.values.varFile?.spec?.store?.spec?.connectorRef
          const isFixedValue = getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED
          const disabled = !selectedType || (isFixedValue && !(connectorRef as ConnectorSelectedValue)?.connector)
          return (
            <>
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                {AllowedTypes.map(item => (
                  <div key={item} className={css.squareCardContainer}>
                    <Card
                      className={css.manifestIcon}
                      selected={item === selectedType}
                      data-testid={`varStore-${item}`}
                      onClick={() => {
                        setSelectedConnector(item)
                        setSelectedType(item)
                        if (isFixedValue) {
                          formik?.setFieldValue('varFile.spec.store.spec.connectorRef', '')
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
                  {selectedType && (
                    <Layout.Horizontal
                      spacing={'medium'}
                      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                    >
                      <FormMultiTypeConnectorField
                        label={
                          <Text style={{ display: 'flex', alignItems: 'center' }}>
                            {selectedType} {getString('connector')}
                            <Button
                              icon="question"
                              minimal
                              tooltip={`${selectedType} ${getString('connector')}`}
                              iconProps={{ size: 14 }}
                            />
                          </Text>
                        }
                        type={ConnectorMap[selectedType]}
                        width={400}
                        name="varFile.spec.store.spec.connectorRef"
                        placeholder={`${getString('select')} ${selectedType} ${getString('connector')}`}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        style={{ marginBottom: 10 }}
                        multiTypeProps={{ expressions, allowableTypes }}
                      />
                      <Button
                        variation={ButtonVariation.LINK}
                        size={ButtonSize.SMALL}
                        disabled={isReadonly}
                        id="new-var-connector"
                        text={newConnectorLabel}
                        className={css.newConnectorButton}
                        icon="plus"
                        iconProps={{ size: 12 }}
                        onClick={() => {
                          if (handleConnectorViewChange) {
                            handleConnectorViewChange()
                          }
                          nextStep?.({ ...prevStepData, selectedType })
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
                    /* istanbul ignore next */
                    onClick={() => {
                      /* istanbul ignore next */
                      nextStep?.({ ...formik.values, selectedType })
                    }}
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
