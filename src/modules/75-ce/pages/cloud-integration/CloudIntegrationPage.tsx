/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the royot of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Button,
  ButtonVariation,
  Card,
  Container,
  ExpandingSearchInput,
  FlexExpander,
  Icon,
  Layout,
  Page,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { PopoverInteractionKind, Position, Tab, Tabs } from '@blueprintjs/core'
import { get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import useK8sQuickCreateModal from '@ce/components/K8sQuickCreate/K8sQuickCreateModal'

import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { CcmMetaData, useFetchCcmMetaDataQuery } from 'services/ce/services'
import { useGetCCMK8SConnectorList } from 'services/cd-ng'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import K8sClustersTab from '@ce/components/CloudIntegrationTabs/K8sClustersTab'
import CloudAccountsTab from '@ce/components/CloudIntegrationTabs/CloudAccountsTab'
import NoConnectors from '@ce/components/CloudIntegrationTabs/NoConnectors'
import { Connectors } from '@connectors/constants'
import { CloudProviderList } from '@ce/components/CreateConnector/CreateConnector'
import {
  CustomK8sPageConnectorResponse,
  getSuccesfullCCMConnectorIds,
  mapCCMK8sMetadataToConnector
} from '@ce/utils/cloudIntegrationUtils'
import { useCCMK8SMetadata } from 'services/ce'
import QuickK8sIcon from '@ce/images/quick-kubernetes.svg'

import { useTelemetry } from '@common/hooks/useTelemetry'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import css from './CloudIntegrationPage.module.scss'

enum CloudIntegrationTabs {
  KubernetesClusters,
  CloudAccounts
}

interface CreateConnectorPopoverProps {
  k8sSelected: boolean
  setK8sSelected: React.Dispatch<React.SetStateAction<boolean>>
  handleConnectorCreation: (selectedProvider: string) => void
  openAdvancedK8sModal: () => void
  openQuicK8sCreateModal: () => void
}

const CreateConnectorPopover = ({
  handleConnectorCreation,
  k8sSelected,
  setK8sSelected,
  openAdvancedK8sModal,
  openQuicK8sCreateModal
}: CreateConnectorPopoverProps): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Container className={css.newConnectorPopover}>
      {k8sSelected ? (
        <>
          <Button
            text={getString('back')}
            className={css.backButton}
            icon="chevron-left"
            variation={ButtonVariation.LINK}
            onClick={() => setK8sSelected(false)}
          />
          <Text font={{ variation: FontVariation.H5 }}>
            {getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}
          </Text>
          <div className={css.k8SCardCtn}>
            <Card onClick={openQuicK8sCreateModal} interactive className={css.k8SCard}>
              <img src={QuickK8sIcon} />
              <Text className={css.recommended} color={Color.PRIMARY_7}>
                {getString('common.recommended')}
              </Text>
            </Card>
            <Card onClick={openAdvancedK8sModal} interactive className={css.k8SCard}>
              <Icon name={'app-kubernetes'} size={34} />
            </Card>
          </div>
          <div className={css.k8SCardLabelCtn}>
            <div>
              <Text color={Color.GREY_700} font={{ variation: FontVariation.H6, weight: 'semi-bold' }}>
                {getString('ce.k8sQuickCreate.quickCreate')}
              </Text>
              <Text color={Color.GREY_700} font={{ variation: FontVariation.SMALL }} margin={{ top: 'small' }}>
                {getString('ce.k8sQuickCreate.time.5mins')}
              </Text>
            </div>
            <div>
              <Text color={Color.GREY_700} font={{ variation: FontVariation.H6, weight: 'semi-bold' }}>
                {getString('ce.k8sQuickCreate.advanced')}
              </Text>
              <Text color={Color.GREY_700} font={{ variation: FontVariation.SMALL }} margin={{ top: 'small' }}>
                {getString('ce.k8sQuickCreate.time.10mins')}
              </Text>
            </div>
          </div>
        </>
      ) : (
        <Container className={css.allConnectorsState}>
          <Text font={{ variation: FontVariation.H5 }}>{getString('ce.cloudIntegration.selectProvider')}</Text>
          <CloudProviderList kubernetesFirst onChange={handleConnectorCreation} iconSize={34} />
        </Container>
      )}
    </Container>
  )
}

const CloudIntegrationPage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()
  const { trackEvent } = useTelemetry()
  const [k8sSelected, setK8sSelected] = useState(false)

  const [ccmMetaResult, refetchCCMMetaData] = useFetchCcmMetaDataQuery()
  const { data: ccmMetaDataRes, fetching: ccmMetaDataLoading } = ccmMetaResult
  const [searchTerm, setSearchTerm] = useState('')

  const ccmMetaData = get(ccmMetaDataRes, 'ccmMetaData') as CcmMetaData

  const [k8sClusters, setK8sClusters] = useState<CustomK8sPageConnectorResponse>()
  const [page, setPage] = useState(0)

  const [selectedTab, setSelectedTab] = useState(CloudIntegrationTabs.KubernetesClusters)

  const { loading, mutate: fetchConnectors } = useGetCCMK8SConnectorList({
    queryParams: {
      searchTerm,
      pageIndex: page,
      pageSize: 10,
      accountIdentifier: accountId
    }
  })

  const { loading: k8sMetadataLoading, mutate: fetchK8sMetadata } = useCCMK8SMetadata({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const getK8sConnectors = async (): Promise<void> => {
    const { data: connectorRes } = await fetchConnectors({ filterType: 'Connector' })

    try {
      const ccmK8sConnectorId = getSuccesfullCCMConnectorIds(connectorRes)

      if (ccmK8sConnectorId.length) {
        const { data: k8sMetadataRes } = await fetchK8sMetadata(
          { ccmK8sConnectorId },
          { headers: { 'Cache-Control': 'max-age=600' } }
        )

        const res = mapCCMK8sMetadataToConnector(connectorRes, k8sMetadataRes)

        setK8sClusters(res)
      } else {
        setK8sClusters(connectorRes)
      }
    } catch (error) {
      setK8sClusters(connectorRes)
    }
  }

  useEffect(() => {
    if (selectedTab === CloudIntegrationTabs.KubernetesClusters) {
      getK8sConnectors()
    }
  }, [page, searchTerm, selectedTab])

  const refetchMetadataAndK8sConnectors = (): void => {
    refetchCCMMetaData({ requestPolicy: 'network-only' })
    getK8sConnectors()
  }

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: /* istanbul ignore next */ refetchMetadataAndK8sConnectors,
    onClose: refetchMetadataAndK8sConnectors
  })

  const [openQuicK8sCreateModal] = useK8sQuickCreateModal({
    onClose: refetchMetadataAndK8sConnectors
  })

  const handleConnectorCreation = /* istanbul ignore next */ (selectedProvider: string): void => {
    let connectorType
    switch (selectedProvider) {
      case 'AWS':
        connectorType = Connectors.CEAWS
        break
      case 'GCP':
        connectorType = Connectors.CE_GCP
        break
      case 'Azure':
        connectorType = Connectors.CE_AZURE
        break
      case 'Kubernetes':
      case 'kubernetesText':
        connectorType = Connectors.KUBERNETES_CLUSTER
        break
    }

    if (connectorType) {
      trackEvent(USER_JOURNEY_EVENTS.ONBOARDING_CONNECTOR_CLICK, { connector: connectorType })
      if (connectorType === Connectors.KUBERNETES_CLUSTER) {
        setK8sSelected(true)
        return
      }

      openConnectorModal(false, connectorType)
    }
  }

  return (
    <>
      <Page.Header title={getString('ce.cloudIntegration.sideNavText')} breadcrumbs={<NGBreadcrumbs />} />
      <div className={css.tabs}>
        {ccmMetaDataLoading ? (
          <ContainerSpinner className={css.spinner} />
        ) : !Utils.accountHasConnectors(ccmMetaData) && !k8sClusters?.content?.length ? (
          <NoConnectors
            setK8sSelected={setK8sSelected}
            k8sSelected={k8sSelected}
            handleConnectorCreation={handleConnectorCreation}
            openAdvancedK8sModal={() => openConnectorModal(false, Connectors.KUBERNETES_CLUSTER)}
            openQuicK8sCreateModal={openQuicK8sCreateModal}
          />
        ) : (
          <>
            <Layout.Horizontal className={css.container}>
              <RbacButton
                variation={ButtonVariation.PRIMARY}
                text={getString('ce.cloudIntegration.newConnectorBtn')}
                icon="plus"
                permission={{
                  permission: PermissionIdentifier.UPDATE_CONNECTOR,
                  resource: { resourceType: ResourceType.CONNECTOR }
                }}
                id="newConnectorBtn"
                data-test="newConnectorButton"
                tooltip={
                  <CreateConnectorPopover
                    handleConnectorCreation={handleConnectorCreation}
                    k8sSelected={k8sSelected}
                    setK8sSelected={setK8sSelected}
                    openAdvancedK8sModal={() => openConnectorModal(false, Connectors.KUBERNETES_CLUSTER)}
                    openQuicK8sCreateModal={openQuicK8sCreateModal}
                  />
                }
                tooltipProps={{
                  minimal: true,
                  position: Position.BOTTOM_LEFT,
                  interactionKind: PopoverInteractionKind.CLICK,
                  popoverClassName: css.popover,
                  onClosed: () => setK8sSelected(false)
                }}
              />
              <FlexExpander />
              <ExpandingSearchInput placeholder={getString('search')} onChange={setSearchTerm} className={css.search} />
            </Layout.Horizontal>
            <Tabs
              renderActiveTabPanelOnly
              id={'cloudIntegrationTabs'}
              onChange={tabId => setSelectedTab(tabId as CloudIntegrationTabs)}
            >
              <Tab
                id={CloudIntegrationTabs.KubernetesClusters}
                panel={
                  <K8sClustersTab
                    ccmMetaData={ccmMetaData}
                    searchTerm={searchTerm}
                    k8sClusters={k8sClusters}
                    getK8sConnectors={getK8sConnectors}
                    loading={loading || k8sMetadataLoading}
                    setPage={setPage}
                  />
                }
                title={
                  <Text
                    icon="app-kubernetes"
                    iconProps={{ padding: { right: 'small' } }}
                    font={{ variation: FontVariation.H6 }}
                  >
                    {getString('ce.cloudIntegration.k8sClusters')}
                  </Text>
                }
              />
              <Tab
                id={CloudIntegrationTabs.CloudAccounts}
                panel={<CloudAccountsTab ccmMetaData={ccmMetaData} searchTerm={searchTerm} />}
                title={
                  <Text
                    icon="cloud-accounts"
                    iconProps={{ padding: { right: 'small' } }}
                    font={{ variation: FontVariation.H6 }}
                  >
                    {getString('ce.cloudIntegration.cloudAccounts')}
                  </Text>
                }
              />
            </Tabs>
          </>
        )}
      </div>
    </>
  )
}

export default CloudIntegrationPage
