/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { pick, defaultTo } from 'lodash-es'

import { StepWizard } from '@harness/uicore'
import type {
  Connector as ConnectorTypeFromAuditService,
  StreamingDestinationAggregateDto
} from '@harnessio/react-audit-service-client'
import type { IStreamingDestinationForm } from '@audit-trail/interfaces/LogStreamingInterface'
import { mapAuditServiceConnectorToCDNGConnectorInfoDTO } from '@audit-trail/interfaces/LogStreamingInterface'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import { Connectors } from '@connectors/constants'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import { buildStreamingDestinationSpecByType } from '@audit-trail/utils/RequestUtil'
import StepOverview from './StepOverview/StepOverview'
import StepStreamingConnector, { CONNECTOR_TYPE } from './StepStreamingConnector/StepStreamingConnector'

interface CreateStreamingDestinationProps {
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  onClose?: any
  data?: StreamingDestinationAggregateDto
}

const createConnectorRef = (connector?: ConnectorTypeFromAuditService): string | undefined => {
  if (connector?.org && connector?.project) {
    return connector.identifier
  } else if (connector?.org) {
    return `${Scope.ORG}.${connector.identifier}`
  }
  // the check below handles the use case: when connector was force-deleted
  return connector?.identifier ? `${Scope.ACCOUNT}.${connector?.identifier}` : undefined
}

const mapSDAggregateToStreamingDestinationForm = <T extends StreamingDestinationAggregateDto>(
  sd?: T
): IStreamingDestinationForm => {
  const specByType = buildStreamingDestinationSpecByType(sd?.streaming_destination?.spec)
  return {
    streamingDestinationIdentifier: defaultTo(sd?.streaming_destination?.identifier, ''), // Streaming Destination Identifier
    identifier: defaultTo(sd?.connector_info?.identifier, ''), // connector identifier
    connector_ref: defaultTo(createConnectorRef(sd?.connector_info), ''),
    description: defaultTo(sd?.streaming_destination?.description, ''),
    name: defaultTo(sd?.streaming_destination?.name, ''),
    status: defaultTo(sd?.streaming_destination?.status, 'INACTIVE'),
    tags: defaultTo(sd?.streaming_destination?.tags, {}),
    ...specByType
  }
}

export const CreateStreamingDestinationWizard: React.FC<CreateStreamingDestinationProps> = props => {
  const { onClose, isEditMode, data } = props
  const { getString } = useStrings()

  const commonProps = pick(props, ['isEditMode', 'setIsEditMode'])

  let sdData: IStreamingDestinationForm = {
    name: '',
    streamingDestinationIdentifier: '',
    connector_ref: '',
    type: 'AWS_S3'
  }

  if (isEditMode) {
    sdData = mapSDAggregateToStreamingDestinationForm(data)
  }

  const connectorInfo = mapAuditServiceConnectorToCDNGConnectorInfoDTO(
    data?.connector_info,
    data?.streaming_destination?.spec?.type ? CONNECTOR_TYPE[data.streaming_destination.spec.type] : undefined
  )

  return (
    <StepWizard title={getString('auditTrail.streamingDestination')}>
      <StepOverview name={getString('overview')} data={sdData} {...commonProps} />
      <StepStreamingConnector
        name={getString('auditTrail.logStreaming.streamingConnector')}
        data={sdData}
        {...commonProps}
      />
      <ConnectorTestConnection
        type={Connectors.Aws}
        name={getString('common.labelTestConnection')}
        connectorInfo={connectorInfo}
        isStep={true}
        isLastStep={true}
        onClose={onClose}
        {...commonProps}
      />
    </StepWizard>
  )
}
