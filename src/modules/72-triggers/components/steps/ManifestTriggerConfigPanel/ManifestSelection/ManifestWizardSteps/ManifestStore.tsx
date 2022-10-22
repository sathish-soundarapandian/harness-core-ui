/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Button,
  Text,
  Formik,
  StepProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  ThumbnailSelect,
  IconName,
  ButtonVariation,
  FormikForm,
  ButtonSize,
  AllowedTypes
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import {
  isConnectorStoreType,
  doesStorehasConnector,
  ManifestIconByType,
  ManifestStoreTitle,
  ManifestToConnectorLabelMap,
  ManifestToConnectorMap
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import type {
  ManifestStepInitData,
  ManifestStores,
  ManifestStoreWithoutConnector
} from '@pipeline/components/ManifestSelection/ManifestInterface'
import css from './ManifestWizardSteps.module.scss'
import style from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactConnector.module.scss'

interface ManifestStorePropType {
  expressions: string[]
  allowableTypes: AllowedTypes
  isReadonly: boolean
  initialValues: ManifestStepInitData
  manifestStores: ManifestStores[]
  handleConnectorViewChange: () => void
  handleStoreChange: (store: ManifestStores) => void
}

export default function ManifestStore({
  handleConnectorViewChange,
  handleStoreChange,
  isReadonly,
  initialValues,
  manifestStores,
  expressions,
  allowableTypes,
  prevStepData,
  nextStep
}: StepProps<ConnectorConfigDTO> & ManifestStorePropType): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [isLoadingConnectors, setIsLoadingConnectors] = useState(true)
  const [selectedStore, setSelectedStore] = useState<ManifestStores>(prevStepData?.store ?? initialValues.store)
  const isValidConnectorStore = (): boolean =>
    !!selectedStore && !doesStorehasConnector(selectedStore as ManifestStoreWithoutConnector)

  const newConnectorLabel = `${getString('newLabel')} ${
    isValidConnectorStore() && getString(ManifestToConnectorLabelMap[selectedStore as ManifestStoreWithoutConnector])
  } ${getString('connector')}`

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.CONNECTOR
    },
    permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
  })

  const submitFirstStep = async (formData: ManifestStepInitData): Promise<void> => {
    nextStep?.({ ...formData })
  }

  function shouldGotoNextStep(connectorRefValue: ConnectorSelectedValue | string): boolean {
    if (doesStorehasConnector(selectedStore as ManifestStoreWithoutConnector)) {
      return true
    }
    return (
      !isLoadingConnectors &&
      !!selectedStore &&
      ((getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED &&
        !isEmpty((connectorRefValue as ConnectorSelectedValue)?.connector)) ||
        !isEmpty(connectorRefValue))
    )
  }
  const handleOptionSelection = (storeSelected: ManifestStoreWithoutConnector): void => {
    handleStoreChange(storeSelected)
    setSelectedStore(storeSelected)
  }

  const getInitialValues = useCallback((): ManifestStepInitData => {
    const initValues = { ...initialValues }
    if (prevStepData) {
      if (prevStepData?.connectorRef) {
        initValues.connectorRef = prevStepData?.connectorRef
      }
      handleStoreChange(selectedStore)
    }
    return { ...initValues, store: selectedStore }
  }, [handleStoreChange, initialValues, prevStepData, selectedStore])

  const supportedStoresItems = manifestStores.map(store => ({
    label: getString(ManifestStoreTitle[store]),
    icon: ManifestIconByType[store] as IconName,
    value: store
  }))

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {`${getString('common.specify')} ${getString('pipeline.manifestTypeLabels.HelmChartLabel')} ${getString(
          'store'
        )}`}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="manifestStore"
        validationSchema={Yup.object().shape({
          connectorRef: Yup.mixed().when('store', {
            is: isConnectorStoreType(),
            then: Yup.mixed().required(
              `${ManifestToConnectorMap[selectedStore as ManifestStoreWithoutConnector]} ${getString(
                'pipelineSteps.build.create.connectorRequiredError'
              )}`
            )
          })
        })}
        onSubmit={formData => {
          submitFirstStep({ ...formData })
        }}
        enableReinitialize={true}
      >
        {formikProps => (
          <FormikForm>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.manifestForm}
            >
              <Layout.Vertical>
                <Layout.Horizontal spacing="large">
                  <ThumbnailSelect
                    className={style.thumbnailSelect}
                    name="store"
                    items={supportedStoresItems}
                    isReadonly={isReadonly}
                    onChange={storeSelected => {
                      formikProps.setFieldValue('connectorRef', '')
                      handleOptionSelection(storeSelected as ManifestStoreWithoutConnector)
                    }}
                    layoutProps={{ className: style.wrapping }}
                  />
                </Layout.Horizontal>

                {!isEmpty(formikProps.values.store) &&
                  !doesStorehasConnector(selectedStore as ManifestStoreWithoutConnector) && (
                    <Layout.Horizontal
                      spacing="medium"
                      flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                      className={css.connectorContainer}
                    >
                      <FormMultiTypeConnectorField
                        key={formikProps.values.store}
                        onLoadingFinish={() => {
                          setIsLoadingConnectors(false)
                        }}
                        name="connectorRef"
                        label={`${getString(
                          ManifestToConnectorLabelMap[formikProps.values.store as ManifestStoreWithoutConnector]
                        )} ${getString('connector')}`}
                        placeholder={`${getString('select')} ${getString(
                          ManifestToConnectorLabelMap[formikProps.values.store as ManifestStoreWithoutConnector]
                        )} ${getString('connector')}`}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        width={400}
                        multiTypeProps={{ expressions, allowableTypes }}
                        isNewConnectorLabelVisible={
                          !(
                            getMultiTypeFromValue(formikProps.values.connectorRef) === MultiTypeInputType.RUNTIME &&
                            (isReadonly || !canCreate)
                          )
                        }
                        createNewLabel={newConnectorLabel}
                        type={ManifestToConnectorMap[formikProps.values.store as ManifestStoreWithoutConnector]}
                        enableConfigureOptions={false}
                        gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                      />

                      <Button
                        variation={ButtonVariation.LINK}
                        size={ButtonSize.SMALL}
                        disabled={isReadonly || !canCreate}
                        id="new-manifest-connector"
                        text={newConnectorLabel}
                        className={css.addNewManifest}
                        icon="plus"
                        iconProps={{ size: 12 }}
                        onClick={() => {
                          handleConnectorViewChange()
                          nextStep?.({ ...prevStepData, store: selectedStore })
                        }}
                      />
                    </Layout.Horizontal>
                  )}
              </Layout.Vertical>

              <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  disabled={!shouldGotoNextStep(formikProps.values.connectorRef as ConnectorSelectedValue)}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
