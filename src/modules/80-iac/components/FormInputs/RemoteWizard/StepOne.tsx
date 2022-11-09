/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Button,
  Text,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  ThumbnailSelect,
  ButtonVariation,
  FormikForm,
  ButtonSize,
  AllowedTypes as MultiTypeAllowedTypes,
  StepProps
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { isEmpty, get } from 'lodash-es'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import { useStrings } from 'framework/strings'

import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/constants'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConnectorIcons, ConnectorLabelMap, ConnectorMap, ConnectorTypes } from './types'

import styles from './styles.module.scss'

type StepOneProps = {
  handleConnectorViewChange: () => void
  handleStoreChange: (store: ConnectorTypes) => void
  stepName: string
  isReadonly: boolean
  connectorTypes: string[]
  initialValues: any
  expressions: string[]
  allowableTypes: MultiTypeAllowedTypes
}

const StepOne: React.FC<StepProps<any> & StepOneProps> = ({
  handleConnectorViewChange,
  handleStoreChange,
  stepName,
  isReadonly,
  connectorTypes,
  initialValues,
  expressions,
  allowableTypes,
  prevStepData,
  nextStep
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<{ repoIdentifier: string; branch: string }>()
  const { getString } = useStrings()

  const [selectedStore, setSelectedStore] = useState(prevStepData?.store ?? initialValues?.store)
  const [multitypeInputValue, setMultiTypeValue] = useState<MultiTypeInputType | undefined>(undefined)

  const newConnectorLabel =
    selectedStore &&
    `${getString('common.new')} ${getString(ConnectorLabelMap[selectedStore as ConnectorTypes])} ${getString(
      'connector'
    )}`

  useEffect(() => {
    const type = get(initialValues, `spec.configuration.spec.store.type`, '')
    setSelectedStore(type)
  }, [initialValues])

  const shouldGotoNextStep = (connectorRefValue: string): boolean => {
    if (getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.RUNTIME) {
      return true
    } else if (getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.EXPRESSION) {
      return !isEmpty(connectorRefValue)
    }

    return getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED && !isEmpty(connectorRefValue)
  }
  const handleOptionSelection = (formikData: any, storeSelected: ConnectorTypes): void => {
    if (
      getMultiTypeFromValue(formikData.connectorRef) !== MultiTypeInputType.FIXED &&
      formikData.store !== storeSelected
    ) {
      setMultiTypeValue(MultiTypeInputType.FIXED)
    } else if (multitypeInputValue !== undefined) {
      setMultiTypeValue(undefined)
    }
    handleStoreChange(storeSelected)
    setSelectedStore(storeSelected)
  }

  const getInitialValues = useCallback(() => {
    const connectorRef = get(initialValues, `spec.configuration.spec.store.spec.connectorRef`, '')
    const store = get(initialValues, `spec.configuration.spec.store.type`, '')
    const initValues = { store, connectorRef }

    if (!isEmpty(selectedStore) && selectedStore !== store) {
      return {
        store: selectedStore,
        connectorRef: ''
      }
    }
    return initValues
  }, [selectedStore])

  const connectorTypesOptions = useMemo(
    (): Item[] =>
      connectorTypes.map((store: string) => ({
        label: store,
        icon: ConnectorIcons[store],
        value: store
      })),
    [connectorTypes]
  )
  const validationSchema = () => {
    return Yup.object().shape({
      connectorRef: Yup.mixed().required(getString('pipelineSteps.build.create.connectorRequiredError'))
    })
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={styles.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxxlarge' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName={`FileStore`}
        validationSchema={validationSchema()}
        onSubmit={formData => nextStep?.({ ...formData })}
        enableReinitialize={true}
      >
        {formik => {
          const { values, setFieldValue } = formik
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={styles.form}
              >
                <Layout.Vertical>
                  <Layout.Horizontal spacing="large">
                    <ThumbnailSelect
                      className={styles.thumbnailSelect}
                      name={'store'}
                      items={connectorTypesOptions}
                      isReadonly={isReadonly}
                      onChange={storeSelected => {
                        handleOptionSelection(values, storeSelected as ConnectorTypes)
                      }}
                    />
                  </Layout.Horizontal>

                  {!isEmpty(values.store) ? (
                    <Layout.Horizontal
                      spacing={'medium'}
                      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                      className={styles.connectorContainer}
                    >
                      <FormMultiTypeConnectorField
                        key={values.store}
                        name="connectorRef"
                        label={`${getString('connector')}`}
                        placeholder={`${getString('select')} ${getString('connector')}`}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        multiTypeProps={{ expressions, allowableTypes }}
                        isNewConnectorLabelVisible={
                          !(getMultiTypeFromValue(values.connectorRef) === MultiTypeInputType.RUNTIME && isReadonly)
                        }
                        createNewLabel={newConnectorLabel}
                        type={ConnectorMap[values.store]}
                        enableConfigureOptions={false}
                        multitypeInputValue={multitypeInputValue}
                        gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                        setRefValue
                        formik={formik}
                      />
                      {getMultiTypeFromValue(values.connectorRef) === MultiTypeInputType.RUNTIME ? (
                        <ConfigureOptions
                          className={styles.configureOptions}
                          value={values.connectorRef as unknown as string}
                          type={ConnectorMap[values.store]}
                          variableName="connectorRef"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => setFieldValue('connectorRef', value)}
                          isReadonly={isReadonly}
                          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                        />
                      ) : (
                        <Button
                          variation={ButtonVariation.LINK}
                          size={ButtonSize.SMALL}
                          disabled={isReadonly}
                          text={newConnectorLabel}
                          className={styles.add}
                          icon="plus"
                          iconProps={{ size: 12 }}
                          onClick={() => {
                            handleConnectorViewChange()
                            nextStep?.({
                              ...prevStepData,
                              store: selectedStore
                            })
                          }}
                        />
                      )}
                    </Layout.Horizontal>
                  ) : null}
                </Layout.Vertical>

                <Layout.Horizontal spacing="medium" className={styles.saveBtn}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    disabled={!shouldGotoNextStep(values?.connectorRef)}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepOne
