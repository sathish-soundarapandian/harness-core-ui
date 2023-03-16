/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  StreamingDestinationStatus,
  StreamingDestinationSpecDto,
  Connector as ConnectorTypeFromAuditService
} from '@harnessio/react-audit-service-client'
import type { ConnectorInfoDTO } from 'services/cd-ng'

export interface IStreamingDestinationForm {
  /**
   * streamingDestinationIdentifier is Identifier for StreamingDestination.
   */
  streamingDestinationIdentifier: string
  /**
   * This is connector identifier, and not streamingDestinationIdentifier.
   * This is needed for ConnectorTestConnection
   */
  identifier?: string
  connector_ref: string
  description?: string
  name: string
  status?: StreamingDestinationStatus
  tags?: {
    [key: string]: string
  }
  type: string
  bucket?: string
}

export const StreamingDestinationSpecDTOTypeMap: Record<string, StreamingDestinationSpecDto['type']> = {
  AWS_S3: 'AWS_S3'
}

export const mapAuditServiceConnectorToCDNGConnectorInfoDTO = (
  connector?: ConnectorTypeFromAuditService,
  type?: ConnectorInfoDTO['type']
): ConnectorInfoDTO | undefined => {
  let connObj: ConnectorInfoDTO | undefined

  if (connector && type) {
    connObj = {
      identifier: connector.identifier,
      name: connector.name,
      spec: {},
      type,
      orgIdentifier: connector.org,
      projectIdentifier: connector.project
    }
  }
  return connObj
}
