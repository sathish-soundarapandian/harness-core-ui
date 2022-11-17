/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Layout } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { useStrings } from 'framework/strings'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { Connectors } from '@connectors/constants'

interface COGatewayBasicsProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  setCloudAccount: (s: string) => void
  provider?: string
}

const COGatewayBasics: React.FC<COGatewayBasicsProps> = props => {
  const { accountId } = useParams<{
    accountId: string
  }>()
  const handleConnectorCreationSuccess = (data: ConnectorInfoDTO | undefined): void => {
    handleConnectorSelection(data as ConnectorInfoDTO)
  }

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: data => {
      handleConnectorCreationSuccess(data?.connector)
    }
  })
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  const [selectedConnector, setSelectedConnector] = useState<ConnectorInfoDTO | null>(null)

  useEffect(() => {
    if (selectedConnector) {
      setSelectedConnector(null)
    }
  }, [props.gatewayDetails.provider.value])

  const handleConnectorSelection = (data: ConnectorInfoDTO): void => {
    setSelectedConnector(data)
    const updatedGatewayDetails = { ...props.gatewayDetails }
    updatedGatewayDetails.cloudAccount = { id: data.identifier?.toString(), name: data.name }
    updatedGatewayDetails.metadata.cloud_provider_details = { name: data.name }
    props.setGatewayDetails(updatedGatewayDetails)
    props.setCloudAccount(updatedGatewayDetails.cloudAccount.id)
    trackEvent('SelectingExistingConnector', {})
  }

  const getConnectorType = (provider: string) => {
    switch (provider) {
      case 'AWS':
        return Connectors.CEAWS
      case 'GCP':
        return Connectors.CE_GCP
      case 'Azure':
        return Connectors.CE_AZURE
      case 'Kubernetes':
        return Connectors.CE_KUBERNETES
      default:
        return null
    }
  }

  const handleConnectorCreation = (selectedProvider: string) => {
    const connectorType = getConnectorType(selectedProvider)

    if (connectorType) {
      openConnectorModal(false, connectorType, {
        connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
      })
    }
  }

  useEffect(() => {
    if (props.provider) {
      handleConnectorCreation(props.provider)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.provider])

  return (
    <div>
      <Layout.Vertical spacing="large">
        <ConnectorReferenceField
          name="cloudAccount"
          selected={props.gatewayDetails.cloudAccount.id || selectedConnector?.identifier}
          label={[
            getString('ce.co.gatewayBasics.connect'),
            props.gatewayDetails.provider.name,
            getString('rbac.account')
          ].join(' ')}
          placeholder={getString('ce.co.gatewayBasics.select')}
          accountIdentifier={accountId}
          onChange={handleConnectorSelection}
          type={
            props.gatewayDetails.provider.value
              ? (getConnectorType(props.gatewayDetails.provider.name) as ConnectorInfoDTO['type'])
              : undefined
          }
        />
      </Layout.Vertical>
      {localStorage.CENGAWSCONNECTOR && (
        <div>
          <span
            onClick={() => {
              openConnectorModal(false, Connectors.CEAWS, {
                connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
              })
            }}
            style={{ fontSize: '13px', color: '#0278D5', lineHeight: '20px', cursor: 'pointer' }}
          >
            Try AWS New Connector
          </span>
        </div>
      )}
      {localStorage.CEGCPCONNECTOR && (
        <div>
          <span
            onClick={() => {
              openConnectorModal(false, Connectors.CE_GCP, {
                connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
              })
            }}
            style={{ fontSize: '13px', color: '#0278D5', lineHeight: '20px', cursor: 'pointer' }}
          >
            Try GCP New Connector
          </span>
        </div>
      )}
    </div>
  )
}

export default COGatewayBasics
