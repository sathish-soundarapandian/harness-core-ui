/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import type { IconName, IconProps } from '@harness/icons'
import qs from 'qs'
import type { CellProps, Column, Renderer } from 'react-table'

import type {
  CcmK8sConnectorResponse,
  ConnectorResponse,
  PageCcmK8sConnectorResponse,
  ConnectorValidationResult,
  ConnectorInfoDTO
} from 'services/cd-ng'
import type { CcmK8sMetaInfo, CcmK8sMetaInfoResponseDTO } from 'services/ce'
import type { CcmMetaData } from 'services/ce/services'
import routes from '@common/RouteDefinitions'
import { CloudProvider } from '@ce/types'
import { generateFilters } from './anomaliesUtils'

export const getConnectorStatusIcon: (status: ConnectorValidationResult['status']) => {
  icon: IconName
  iconProps: Partial<IconProps>
} = status =>
  status === 'SUCCESS'
    ? { icon: 'full-circle', iconProps: { size: 8, color: Color.GREEN_500 } }
    : { icon: 'warning-sign', iconProps: { size: 12, color: Color.RED_500 } }

/**
 * Kubernetes Clusters Tab
 */

export type CustomK8sConnectorResponse = CcmK8sConnectorResponse & {
  metadata?: CcmK8sMetaInfo
}

export type CustomK8sPageConnectorResponse = PageCcmK8sConnectorResponse & {
  content?: {
    metadata?: CcmK8sMetaInfo
  }
}

export type CustomK8sColumn = Column<CustomK8sConnectorResponse>[]
export type CustomK8sCell = Renderer<CellProps<CustomK8sConnectorResponse>>

export const mapCCMK8sMetadataToConnector = (
  connectors?: PageCcmK8sConnectorResponse,
  ccmK8sMetadata?: CcmK8sMetaInfoResponseDTO
): CustomK8sPageConnectorResponse => {
  return {
    ...connectors,
    content: connectors?.content?.map(item => ({
      ...item,
      metadata: ccmK8sMetadata?.ccmK8sMeta?.find(
        meta => meta.ccmk8sConnectorId === item.ccmk8sConnector?.[0]?.connector?.identifier
      )
    }))
  }
}

export const getSuccesfullCCMConnectorIds = (connectors?: PageCcmK8sConnectorResponse): string[] =>
  connectors?.content
    ?.filter(item => item.ccmk8sConnector?.[0]?.status?.status === 'SUCCESS')
    .map(item => item.ccmk8sConnector?.[0]?.connector?.identifier)
    .filter(item => item) as string[]

export const getReportingTooltipIcon = (
  isConnectorStatusSuccess: boolean,
  isLastEventRecieved: boolean
): { name: IconName; color: Color } => {
  if (!isConnectorStatusSuccess) {
    return { name: 'warning-sign', color: Color.RED_700 }
  }
  if (!isLastEventRecieved) {
    return { name: 'heart-broken', color: Color.RED_700 }
  }

  return { name: 'heart', color: Color.GREEN_700 }
}

export const lastEventRecieved = (metadata?: CcmK8sMetaInfo): boolean =>
  !!metadata?.visibility?.[0]?.includes('last event received at')

/**
 * Cloud Accounts Tab
 */

export type CustomCloudColumn = Column<ConnectorResponse>[]
export type CustomCloudCell = Renderer<CellProps<ConnectorResponse>>

const defaultPerspectiveIdMap: Record<string, keyof CcmMetaData> = {
  CEAzure: 'defaultAzurePerspectiveId',
  CEAws: 'defaultAwsPerspectiveId',
  GcpCloudCost: 'defaultGcpPerspectiveId'
}

const connectorTypeToCloudProvider: Record<string, CloudProvider> = {
  CEAzure: CloudProvider.AZURE,
  CEAws: CloudProvider.AWS,
  GcpCloudCost: CloudProvider.GCP
}

export const getCloudViewCostsLink = ({
  accountId,
  connector,
  ccmMetaData
}: {
  accountId: string
  connector?: ConnectorInfoDTO
  ccmMetaData?: CcmMetaData | null
}): string | undefined => {
  const defaultPerspectiveId = ccmMetaData?.[defaultPerspectiveIdMap[connector?.type || '']] as string

  if (!defaultPerspectiveId) {
    return
  }

  let filters = {}

  switch (connector?.type) {
    case 'CEAzure': {
      filters = { azureSubscriptionGuid: connector?.spec?.subscriptionId }
      break
    }
    case 'CEAws': {
      filters = { awsUsageAccountId: connector?.spec?.awsAccountId }
      break
    }
    case 'GcpCloudCost': {
      filters = { gcpProjectId: connector?.spec?.projectId }
    }
  }

  return (
    routes.toPerspectiveDetails({
      accountId: accountId,
      perspectiveId: defaultPerspectiveId,
      perspectiveName: defaultPerspectiveId
    }) +
    `?${qs.stringify({
      filters: JSON.stringify(generateFilters(filters, connectorTypeToCloudProvider[connector?.type || '']))
    })}`
  )
}
