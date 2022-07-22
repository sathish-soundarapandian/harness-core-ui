/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import AddClusterImage from './images/AddCluster.svg'
import css from './OverviewPage.module.scss'

export interface OverviewAddClusterProps {
  onAddClusterSuccess: () => void
  descriptionText?: string
}

const OverviewAddCluster = ({ onAddClusterSuccess, descriptionText }: OverviewAddClusterProps) => {
  const { getString } = useStrings()
  const { openConnectorModal, hideConnectorModal } = useCreateConnectorModal({
    onSuccess: () => {
      onAddClusterSuccess()
      hideConnectorModal()
    }
  })

  return (
    <div className={css.addCluster}>
      <img src={AddClusterImage} height={150} />
      <Container width={650}>
        <Text
          style={{
            textAlign: 'center'
          }}
        >
          {descriptionText ? descriptionText : getString('ce.overview.addClusterDesc')}
        </Text>
      </Container>
      <Button
        withoutBoxShadow={true}
        className={css.addClusterBtn}
        text={getString('ce.overview.addClusterBtn')}
        onClick={() => {
          openConnectorModal(false, Connectors.CE_KUBERNETES, {
            connectorInfo: { orgIdentifier: '', projectIdentifier: '' } as unknown as ConnectorInfoDTO
          })
        }}
      />
    </div>
  )
}

export default OverviewAddCluster
