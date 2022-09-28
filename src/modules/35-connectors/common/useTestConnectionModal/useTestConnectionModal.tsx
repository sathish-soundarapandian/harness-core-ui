/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Container } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'

import type { ConnectorInfoDTO, EntityGitDetails } from 'services/cd-ng'
import ConnectorTestConnection from '../ConnectorTestConnection/ConnectorTestConnection'
import css from './useTestConnectionModal.module.scss'

export interface UseTestConnectionModalProps {
  onClose?: () => void
}

export interface UseTestConnectionModalReturn {
  openErrorModal: (connectorTestDetails: IConnectorTestDetails) => void
  hideErrorModal: () => void
}
const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 850,
    minHeight: 345,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

interface IConnectorTestDetails {
  connector: ConnectorInfoDTO
  testUrl: string
  gitDetails?: EntityGitDetails
}

const useTestConnectionModal = (props: UseTestConnectionModalProps): UseTestConnectionModalReturn => {
  const [testDetails, setTestDetails] = useState<IConnectorTestDetails>({
    connector: {},
    testUrl: '',
    gitDetails: {}
  } as IConnectorTestDetails)

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <Container height={'100%'} padding="xxlarge">
          <ConnectorTestConnection
            connectorInfo={testDetails.connector}
            gitDetails={testDetails.gitDetails}
            isStep={false}
            url={testDetails.testUrl}
            type={testDetails.connector.type}
          />
        </Container>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            props.onClose?.()
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [testDetails]
  )

  return {
    openErrorModal: (connectorTestDetails: IConnectorTestDetails) => {
      setTestDetails(connectorTestDetails)
      showModal()
    },
    hideErrorModal: hideModal
  }
}

export default useTestConnectionModal
