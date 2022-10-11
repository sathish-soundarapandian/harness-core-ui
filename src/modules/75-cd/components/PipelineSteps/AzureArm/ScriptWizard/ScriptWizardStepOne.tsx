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
  ButtonSize
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { isEmpty, get } from 'lodash-es'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import {
  ConnectorIcons,
  ConnectorLabelMap,
  ConnectorMap,
  ConnectorTypes
} from '../../AzureWebAppServiceSpec/AzureWebAppStartupScriptSelection/StartupScriptInterface.types'

import css from './ScriptWizard.module.scss'

export const ScriptWizardStepOne = ({
  handleConnectorViewChange,
  handleStoreChange,
  stepName,
  isReadonly,
  connectorTypes,
  initialValues,
  expressions,
  allowableTypes,
  prevStepData,
  nextStep,
  isParam
}: any): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  /* istanbul ignore next */
  const [selectedStore, setSelectedStore] = useState(prevStepData?.store ?? initialValues?.store)
  const [multitypeInputValue, setMultiTypeValue] = useState<MultiTypeInputType | undefined>(undefined)

  const newConnectorLabel =
    selectedStore &&
    `${getString('newLabel')} ${getString(ConnectorLabelMap[selectedStore as ConnectorTypes])} ${getString(
      'connector'
    )}`

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.CONNECTOR
    },
    permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
  })

  useEffect(() => {
    const type = get(initialValues, `spec.configuration.${isParam ? 'parameters' : 'template'}.store.type`, '')
    setSelectedStore(type)
  }, [initialValues])

  const shouldGotoNextStep = /* istanbul ignore next */ (
    connectorRefValue: ConnectorSelectedValue | string
  ): boolean => {
    if (selectedStore === 'Harness') {
      return true
    } else if (getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.RUNTIME) {
      return true
    } else if (getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.EXPRESSION) {
      return !isEmpty(connectorRefValue)
    }

    return (
      getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED &&
      !isEmpty((connectorRefValue as ConnectorSelectedValue)?.connector)
    )
  }
  const handleOptionSelection = /* istanbul ignore next */ (formikData: any, storeSelected: ConnectorTypes): void => {
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
    const connectorRef = get(
      initialValues,
      `spec.configuration.${isParam ? 'parameters' : 'template'}.store.spec.connectorRef`,
      ''
    )
    const store = get(initialValues, `spec.configuration.${isParam ? 'parameters' : 'template'}.store.type`, '')
    const initValues = { store, connectorRef }
    /* istanbul ignore next */
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
    if (selectedStore === 'Harness') return
    return Yup.object().shape({
      connectorRef: Yup.mixed().required(getString('pipelineSteps.build.create.connectorRequiredError'))
    })
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxxlarge' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName={`azureArm${isParam ? 'Parameter' : 'Template'}FileStore`}
        validationSchema={validationSchema()}
        onSubmit={/* istanbul ignore next */ formData => nextStep?.({ ...formData })}
        enableReinitialize={true}
      >
        {formik => {
          const { values, setFieldValue } = formik
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.startupScriptForm}
              >
                <Layout.Vertical>
                  <Layout.Horizontal spacing="large">
                    <ThumbnailSelect
                      className={css.thumbnailSelect}
                      name={'store'}
                      items={connectorTypesOptions}
                      isReadonly={isReadonly}
                      onChange={storeSelected => {
                        handleOptionSelection(values, storeSelected as ConnectorTypes)
                      }}
                    />
                  </Layout.Horizontal>

                  {!isEmpty(values.store) && values.store !== 'Harness' ? (
                    <Layout.Horizontal
                      spacing={'medium'}
                      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                      className={css.connectorContainer}
                    >
                      <FormMultiTypeConnectorField
                        key={values.store}
                        name="connectorRef"
                        label={`${getString('connector')}`}
                        placeholder={`${getString('select')} ${getString('connector')}`}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        width={400}
                        multiTypeProps={{ expressions, allowableTypes }}
                        isNewConnectorLabelVisible={
                          /* istanbul ignore next */
                          !(
                            getMultiTypeFromValue(values.connectorRef) === MultiTypeInputType.RUNTIME &&
                            (isReadonly || !canCreate)
                          )
                        }
                        createNewLabel={newConnectorLabel}
                        type={ConnectorMap[values.store]}
                        enableConfigureOptions={false}
                        multitypeInputValue={multitypeInputValue}
                        gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                      />
                      {
                        /* istanbul ignore next */ getMultiTypeFromValue(values.connectorRef) ===
                        MultiTypeInputType.RUNTIME ? (
                          <ConfigureOptions
                            className={css.configureOptions}
                            value={values.connectorRef as unknown as string}
                            type={ConnectorMap[values.store]}
                            variableName="connectorRef"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={
                              /* istanbul ignore next */ value => {
                                setFieldValue('connectorRef', value)
                              }
                            }
                            isReadonly={isReadonly}
                            allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                          />
                        ) : (
                          <Button
                            variation={ButtonVariation.LINK}
                            size={ButtonSize.SMALL}
                            disabled={isReadonly || !canCreate}
                            data-testid="newConnectorButton"
                            text={newConnectorLabel}
                            className={css.addStartupScript}
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
                        )
                      }
                    </Layout.Horizontal>
                  ) : null}
                </Layout.Vertical>

                <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('continue')}
                    rightIcon="chevron-right"
                    disabled={
                      /* istanbul ignore next */
                      !shouldGotoNextStep(values?.connectorRef as ConnectorSelectedValue | string)
                    }
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
