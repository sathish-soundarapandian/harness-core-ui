/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  FlexExpander,
  getErrorInfoFromErrorObject,
  Icon,
  IconName,
  Layout,
  TableV2,
  Text,
  useToaster
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import qs from 'qs'
import cx from 'classnames'
import ReactTimeago from 'react-timeago'
import { defaultTo } from 'lodash-es'

import routes from '@common/RouteDefinitions'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { useStrings } from 'framework/strings'
import { ConnectorInfoDTO, useDeleteConnector } from 'services/cd-ng'
import type { CcmMetaData } from 'services/ce/services'
import { generateFilters } from '@ce/utils/anomaliesUtils'
import { GROUP_BY_CLUSTER_NAME } from '@ce/utils/perspectiveUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import RbacButton from '@rbac/components/Button/Button'
import { CloudProvider } from '@ce/types'
import { ConnectorStatus } from '@ce/constants'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import useTestConnectionModal from '@connectors/common/useTestConnectionModal/useTestConnectionModal'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import {
  CustomK8sCell,
  CustomK8sColumn,
  CustomK8sConnectorResponse,
  CustomK8sPageConnectorResponse,
  getConnectorStatusIcon,
  getReportingTooltipIcon,
  lastEventRecieved
} from '@ce/utils/cloudIntegrationUtils'

import { useCloudVisibilityModal } from '../CloudVisibilityModal/CloudVisibilityModal'
import { useAutoStoppingModal } from '../AutoStoppingModal/AutoStoppingModal'
import { EmptySearchState } from './NoConnectors'
import { useDeleteConnectorModal } from './useDeleteConnectorModal'

import css from './CloudIntegrationTabs.module.scss'

const ConnectorNameCell: CustomK8sCell = ({ row, column }) => {
  const k8sConnector = row.original?.k8sConnector?.connector as ConnectorInfoDTO

  const [canUpdate] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: k8sConnector?.identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
    },
    [k8sConnector?.identifier]
  )

  return (
    <Text
      icon="app-kubernetes"
      iconProps={{ size: 30, margin: { right: 'small' } }}
      font={{ variation: FontVariation.BODY2 }}
      className={css.nameCell}
      onClick={() => {
        if (canUpdate) {
          ;(column as any).openConnectorModal(true, 'K8sCluster', { connectorInfo: k8sConnector })
        }
      }}
      lineClamp={1}
    >
      {k8sConnector.name}
    </Text>
  )
}

const ConnectorStatusCell: CustomK8sCell = cell => {
  const status = cell.row.original.k8sConnector?.status

  const isStatusSuccess = status?.status === ConnectorStatus.SUCCESS

  return (
    <div className={css.statusCell}>
      <Text
        {...getConnectorStatusIcon(status?.status)}
        font={{ variation: FontVariation.BODY }}
        tooltip={
          <Text
            icon="warning-sign"
            iconProps={{
              color: Color.RED_700,
              padding: { right: 'small' },
              style: { alignSelf: 'flex-start' },
              size: 18
            }}
            className={css.statusError}
            color={Color.WHITE}
            font={{ variation: FontVariation.BODY }}
          >
            {status?.errorSummary?.trim()}
          </Text>
        }
        tooltipProps={{ isDark: true, position: 'bottom', disabled: isStatusSuccess }}
        color={Color.GREY_800}
      >
        <ReactTimeago date={status?.lastTestedAt || status?.testedAt || ''} />
      </Text>
    </div>
  )
}

const FeaturesEnabledCell: CustomK8sCell = ({ row, column }) => {
  const { getString } = useStrings()
  const data = row.original

  const featureInfo = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.CCM_K8S_CLUSTERS
    }
  })

  const k8sConnector = data?.k8sConnector?.connector as ConnectorInfoDTO
  const metadata = data?.metadata
  const ccmk8sConnectorList = data?.ccmk8sConnector

  const ccmk8sConnector = ccmk8sConnectorList?.[0]?.connector as ConnectorInfoDTO
  const permissions = (ccmk8sConnector?.spec?.featuresEnabled || []) as string[]

  const [openCloudVisibilityModal] = useCloudVisibilityModal({
    connector: k8sConnector,
    onClose: (column as any).refetchCCMK8sConnectorList
  })
  const [openAutoStoppingModal] = useAutoStoppingModal({
    connector: ccmk8sConnector,
    onClose: (column as any).refetchCCMK8sConnectorList
  })

  const isAutoStoppingEnabled = permissions.includes('OPTIMIZATION')

  const isConnectorStatusSuccess = ccmk8sConnectorList?.[0]?.status?.status === ConnectorStatus.SUCCESS

  const props = useMemo(() => {
    if (isConnectorStatusSuccess) {
      return {
        className: cx(css.permissionTag, css.success),
        background: Color.PURPLE_50,
        color: Color.PURPLE_700,
        icon: 'tick' as IconName,
        iconProps: { size: 14, color: Color.PURPLE_700 }
      }
    } else {
      return {
        className: cx(css.permissionTag, css.failure),
        background: Color.RED_50,
        color: Color.RED_800,
        icon: 'warning-sign' as IconName,
        iconProps: { size: 14, color: Color.RED_700 }
      }
    }
  }, [isConnectorStatusSuccess])

  const isLastEventRecieved = lastEventRecieved(metadata)

  const tooltipText = isConnectorStatusSuccess
    ? metadata?.visibility?.[0]
    : ccmk8sConnectorList?.[0]?.status?.errorSummary?.trim()

  return (
    <Layout.Horizontal className={css.features}>
      {!ccmk8sConnectorList?.length ? (
        <RbacButton
          icon="ccm-solid"
          variation={ButtonVariation.SECONDARY}
          className={css.enableCloudCostsBtn}
          text={getString('ce.cloudIntegration.enableCloudCosts')}
          permission={{
            permission: PermissionIdentifier.UPDATE_CONNECTOR,
            resource: { resourceType: ResourceType.CONNECTOR }
          }}
          onClick={() => {
            openCloudVisibilityModal()
          }}
          tooltip={
            <FeatureWarningTooltip
              featureName={FeatureIdentifier.CCM_K8S_CLUSTERS}
              warningMessage={getString('connectors.ceK8.featureWarning', {
                count: featureInfo.featureDetail?.count,
                limit: featureInfo.featureDetail?.limit
              })}
            />
          }
          tooltipProps={{ disabled: featureInfo.enabled }}
          disabled={!featureInfo.enabled}
        />
      ) : (
        <>
          <Text
            {...props}
            tooltip={
              <Layout.Horizontal className={css.lastEvent} spacing={'small'}>
                <Icon {...getReportingTooltipIcon(isConnectorStatusSuccess, isLastEventRecieved)} size={18} />
                <Text color={Color.WHITE} font={{ variation: FontVariation.BODY }}>
                  {tooltipText}
                </Text>
              </Layout.Horizontal>
            }
            tooltipProps={{ isDark: true, disabled: !tooltipText, position: Position.BOTTOM }}
          >
            {getString('ce.cloudIntegration.reporting')}
          </Text>
          {isAutoStoppingEnabled ? (
            <Text {...props}>{getString('common.ce.autostopping')}</Text>
          ) : (
            <RbacButton
              icon="plus"
              variation={ButtonVariation.SECONDARY}
              className={css.addAutoStoppingBtn}
              text={getString('common.ce.autostopping')}
              onClick={openAutoStoppingModal}
              permission={{
                permission: PermissionIdentifier.UPDATE_CONNECTOR,
                resource: { resourceType: ResourceType.CONNECTOR, resourceIdentifier: ccmk8sConnector?.identifier }
              }}
            />
          )}
          <FlexExpander />
          <Button
            icon="repeat"
            iconProps={{ size: 12 }}
            variation={ButtonVariation.LINK}
            text={getString('common.smtp.testConnection')}
            size={ButtonSize.SMALL}
            onClick={() => {
              ;(column as any).openTestConnectionModal({ connector: ccmk8sConnector })
            }}
          />
        </>
      )}
    </Layout.Horizontal>
  )
}

const ViewCostsCell: CustomK8sCell = ({ row, column }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()
  const data = row.original
  const defaultClusterPerspectiveId = (column as any).defaultClusterPerspectiveId

  const ccmk8sConnectorList = data?.ccmk8sConnector
  const clusterName = data?.metadata?.clusterName || ''

  const isLastEventRecieved = lastEventRecieved(data?.metadata)

  const route = useMemo(
    () =>
      routes.toPerspectiveDetails({
        accountId: accountId,
        perspectiveId: defaultClusterPerspectiveId,
        perspectiveName: defaultClusterPerspectiveId
      }) +
      `?${qs.stringify({
        filters: JSON.stringify(generateFilters({ clusterName }, CloudProvider.CLUSTER)),
        groupBy: JSON.stringify(GROUP_BY_CLUSTER_NAME)
      })}`,
    []
  )

  return (
    <Button
      variation={ButtonVariation.LINK}
      disabled={!ccmk8sConnectorList?.length || !isLastEventRecieved}
      margin={{ right: 'xxlarge' }}
      rightIcon="launch"
      iconProps={{ size: 12, color: Color.PRIMARY_7 }}
      text={getString('ce.cloudIntegration.viewCosts')}
      style={{ float: 'right' }}
      onClick={
        /* istanbul ignore next */ () => {
          const baseUrl = window.location.href.split('#')[0]
          window.open(`${baseUrl}#${route}`, '_blank')
        }
      }
    />
  )
}

const MenuCell: CustomK8sCell = ({ row, column }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()
  const { showSuccess, showError } = useToaster()

  const k8sConnector = row.original.k8sConnector?.connector
  const ccmk8sConnector = row.original.ccmk8sConnector?.[0]?.connector

  const [menuOpen, setMenuOpen] = useState(false)

  const handleEditK8sConnector = (): void => {
    ;(column as any).openConnectorModal(true, 'K8sCluster', { connectorInfo: k8sConnector })
  }

  const [openCloudVisibilityModal] = useCloudVisibilityModal({
    isEditMode: true,
    connector: ccmk8sConnector as ConnectorInfoDTO,
    onClose: (column as any).refetchCCMK8sConnectorList
  })

  const { mutate: deleteConnector } = useDeleteConnector({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const handleDelete = async (): Promise<void> => {
    try {
      if (ccmk8sConnector?.identifier) {
        await deleteConnector(ccmk8sConnector?.identifier || '', {
          headers: { 'content-type': 'application/json' }
        })
      }

      const k8sConnectorDeleted = await deleteConnector(k8sConnector?.identifier || '', {
        headers: { 'content-type': 'application/json' }
      })

      if (k8sConnectorDeleted) {
        showSuccess(getString('connectors.deletedSuccssMessage', { name: k8sConnector?.name }))
      }
    } catch (error) {
      showError(getErrorInfoFromErrorObject(error))
    } finally {
      ;(column as any).refetchCCMK8sConnectorList()
    }
  }

  const [openDeleteConnectorModal] = useDeleteConnectorModal({
    onDelete: handleDelete
  })

  const [canUpdate, canDelete] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: k8sConnector?.identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR, PermissionIdentifier.DELETE_CONNECTOR]
    },
    [k8sConnector?.identifier]
  )

  const [canUpdateCcmK8sConnector] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: defaultTo(ccmk8sConnector?.identifier, '')
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR, PermissionIdentifier.DELETE_CONNECTOR]
    },
    [ccmk8sConnector?.identifier]
  )

  return (
    <Popover
      isOpen={menuOpen}
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_RIGHT}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
    >
      <Button minimal icon="Options" onClick={() => setMenuOpen(true)} />
      <Menu>
        <Menu.Item
          icon="edit"
          text={getString('ce.cloudIntegration.editConnector')}
          onClick={handleEditK8sConnector}
          disabled={!canUpdate}
        />
        {ccmk8sConnector ? (
          <Menu.Item
            icon="edit"
            text={getString('ce.cloudIntegration.editCostAccessFeatures')}
            onClick={openCloudVisibilityModal}
            disabled={!canUpdateCcmK8sConnector}
          />
        ) : null}
        <Menu.Item
          icon="trash"
          text={getString('ce.cloudIntegration.deleteConnector')}
          onClick={openDeleteConnectorModal}
          disabled={!canDelete}
        />
      </Menu>
    </Popover>
  )
}

interface K8sClustersTabProps {
  ccmMetaData: CcmMetaData
  searchTerm: string
  k8sClusters?: CustomK8sPageConnectorResponse
  loading: boolean
  getK8sConnectors: () => void
  setPage: React.Dispatch<React.SetStateAction<number>>
}

const K8sClustersTab: React.FC<K8sClustersTabProps> = ({
  ccmMetaData,
  searchTerm,
  k8sClusters,
  getK8sConnectors,
  loading,
  setPage
}) => {
  const { getString } = useStrings()

  const defaultClusterPerspectiveId = ccmMetaData?.defaultClusterPerspectiveId as string

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: getK8sConnectors,
    onClose: getK8sConnectors
  })

  const { openErrorModal } = useTestConnectionModal({
    onClose: getK8sConnectors
  })

  const columns = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('connectors.name'),
        Cell: ConnectorNameCell,
        width: '20%',
        openConnectorModal
      },
      {
        accessor: 'status',
        Header: getString('ce.cloudIntegration.connectorStatus'),
        Cell: ConnectorStatusCell,
        width: '20%'
      },
      {
        accessor: 'featuresEnabled',
        Header: getString('ce.cloudIntegration.featuresEnabled'),
        Cell: FeaturesEnabledCell,
        width: '35%',
        refetchCCMK8sConnectorList: getK8sConnectors,
        openTestConnectionModal: openErrorModal
      },
      {
        accessor: 'viewCosts',
        Header: '',
        Cell: ViewCostsCell,
        width: '20%',
        defaultClusterPerspectiveId
      },
      {
        accessor: 'menu',
        Header: '',
        Cell: MenuCell,
        width: '5%',
        openConnectorModal,
        refetchCCMK8sConnectorList: getK8sConnectors
      }
    ],
    [defaultClusterPerspectiveId, getString]
  )

  if (loading) {
    return <ContainerSpinner className={css.spinner} />
  }

  if (searchTerm && !k8sClusters?.content?.length) {
    return <EmptySearchState />
  }

  return (
    <Container className={css.main}>
      <TableV2<CustomK8sConnectorResponse>
        data={k8sClusters?.content || []}
        columns={columns as CustomK8sColumn}
        className={css.table}
        pagination={{
          itemCount: defaultTo(k8sClusters?.totalItems, 0),
          pageSize: defaultTo(k8sClusters?.pageSize, 10),
          pageCount: defaultTo(k8sClusters?.totalPages, -1),
          pageIndex: defaultTo(k8sClusters?.pageIndex, 0),
          gotoPage: /* istanbul ignore next */ pageNo => setPage(pageNo)
        }}
      />
    </Container>
  )
}

export default K8sClustersTab
