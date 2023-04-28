/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Button,
  Text,
  Formik,
  StepProps,
  getMultiTypeFromValue,
  AllowedTypes,
  ThumbnailSelect,
  IconName,
  ButtonVariation,
  FormikForm,
  ButtonSize,
  MultiTypeInputType
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ServiceHookInitStepData, ServiceHookStoreType } from '../../ServiceHooksInterface'
import {
  ServiceHookStoreTypeTitle,
  ServiceHookStoreIconByType,
  ServiceHooksToConnectorMap,
  ServiceHooksMap,
  doesStoreHasConnector
} from '../../ServiceHooksHelper'
import css from './ServiceHooksDetailsStep.module.scss'

interface ServiceHooksStorePropType {
  initialValues: ServiceHookInitStepData
  expressions: string[]
  allowableTypes: AllowedTypes
  stepName: string
  isReadonly: boolean
  serviceHooksStoreTypes: Array<ServiceHookStoreType>
  isNewServiceHook: boolean
  serviceHookIndex?: number
  handleStoreChange: (storeType: ServiceHookStoreType) => void
  handleConnectorViewChange: () => void
}

function ServiceHooksStore({
  handleConnectorViewChange,
  handleStoreChange,
  stepName,
  isReadonly,
  serviceHooksStoreTypes,
  initialValues,
  expressions,
  allowableTypes,
  prevStepData,
  nextStep
}: StepProps<ConnectorConfigDTO> & ServiceHooksStorePropType): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const [selectedStore, setSelectedStore] = useState(prevStepData?.storeType ?? initialValues.storeType)
  const [multitypeInputValue, setMultiTypeValue] = useState<MultiTypeInputType | undefined>(undefined)

  function isValidConnectorStore(): boolean {
    return !!selectedStore && selectedStore !== ServiceHooksMap.InheritFromManifest
  }

  const newConnectorLabel = `${getString('newLabel')} ${
    isValidConnectorStore() && getString(ServiceHookStoreTypeTitle[selectedStore as ServiceHookStoreType])
  } ${getString('connector')}`

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.CONNECTOR
    },
    permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
  })

  const submitFirstStep = async (formData: any): Promise<void> => {
    nextStep?.({ ...formData })
  }

  function shouldGotoNextStep(connectorRefValue: ConnectorSelectedValue | string): boolean {
    if (doesStoreHasConnector(selectedStore)) {
      return true
    }
    /* istanbul ignore next */
    return (
      !!selectedStore &&
      ((getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED &&
        !isEmpty((connectorRefValue as ConnectorSelectedValue)?.connector)) ||
        !isEmpty(connectorRefValue))
    )
  }
  const handleOptionSelection = (formikData: any, storeSelected: ServiceHookStoreType): void => {
    /* istanbul ignore next */ if (
      getMultiTypeFromValue(formikData.connectorRef) !== MultiTypeInputType.FIXED &&
      formikData.storeType !== storeSelected
    ) {
      setMultiTypeValue(MultiTypeInputType.FIXED)
    } else if (multitypeInputValue !== undefined) {
      setMultiTypeValue(undefined)
    }
    handleStoreChange(storeSelected)
    setSelectedStore(storeSelected)
  }

  const getInitialValues = useCallback((): any => {
    const initValues = { ...initialValues, ...prevStepData }

    return { ...initValues, storeType: selectedStore }
  }, [initialValues, prevStepData, selectedStore])

  const supportedConfigFilesStores = useMemo(
    () =>
      serviceHooksStoreTypes.map((storeType: ServiceHookStoreType) => ({
        label: getString(ServiceHookStoreTypeTitle[storeType]),
        icon: ServiceHookStoreIconByType[storeType] as IconName,
        value: storeType
      })),
    [serviceHooksStoreTypes, getString]
  )

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="configFilesStore"
        validationSchema={Yup.object().shape({
          storeType: Yup.string().required(getString('connectors.chooseMethodForConnection'))
        })}
        onSubmit={formData => {
          submitFirstStep({ ...formData })
        }}
        enableReinitialize={true}
      >
        {formik => (
          <FormikForm>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.configFilesForm}
            >
              <Layout.Vertical>
                <Layout.Horizontal spacing="large">
                  <ThumbnailSelect
                    className={css.thumbnailSelect}
                    name={'storeType'}
                    items={supportedConfigFilesStores}
                    isReadonly={isReadonly}
                    onChange={storeSelected => {
                      handleOptionSelection(formik?.values, storeSelected as ServiceHookStoreType)
                    }}
                  />
                </Layout.Horizontal>

                {!isEmpty(formik.values.storeType) && !doesStoreHasConnector(selectedStore) ? (
                  <Layout.Horizontal
                    spacing={'medium'}
                    flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                    className={css.connectorContainer}
                  >
                    <FormMultiTypeConnectorField
                      key={formik.values.storeType}
                      name="connectorRef"
                      label={`${getString(
                        ServiceHookStoreTypeTitle[formik.values.storeType as ServiceHookStoreType]
                      )} ${getString('connector')}`}
                      placeholder={`${getString('select')} ${getString(
                        ServiceHookStoreTypeTitle[formik.values.storeType as ServiceHookStoreType]
                      )} ${getString('connector')}`}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      width={400}
                      multiTypeProps={{ expressions, allowableTypes }}
                      isNewConnectorLabelVisible={
                        !(
                          getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME &&
                          (isReadonly || !canCreate)
                        )
                      }
                      createNewLabel={newConnectorLabel}
                      type={ServiceHooksToConnectorMap[formik.values.storeType]}
                      enableConfigureOptions={false}
                      multitypeInputValue={multitypeInputValue}
                      gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    />
                    {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME ? (
                      <ConfigureOptions
                        className={css.configureOptions}
                        value={formik.values.connectorRef as unknown as string}
                        type={ServiceHooksToConnectorMap[formik.values.storeType]}
                        variableName="connectorRef"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={
                          /* istanbul ignore next */ value => {
                            formik.setFieldValue('connectorRef', value)
                          }
                        }
                        isReadonly={isReadonly}
                      />
                    ) : (
                      <Button
                        variation={ButtonVariation.LINK}
                        size={ButtonSize.SMALL}
                        disabled={isReadonly || !canCreate}
                        id="new-configfile-connector"
                        text={newConnectorLabel}
                        className={css.addNewConfigFiles}
                        icon="plus"
                        iconProps={{ size: 12 }}
                        onClick={
                          /* istanbul ignore next */ () => {
                            handleConnectorViewChange()
                            nextStep?.({ ...prevStepData, storeType: selectedStore })
                          }
                        }
                      />
                    )}
                  </Layout.Horizontal>
                ) : null}
              </Layout.Vertical>

              <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  disabled={!shouldGotoNextStep(formik.values.connectorRef as ConnectorSelectedValue | string)}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default ServiceHooksStore
