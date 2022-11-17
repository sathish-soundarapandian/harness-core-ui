/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import type { IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { Connectors } from '@connectors/constants'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import DialogWithExtension from '@ce/common/DialogWithExtension/DialogWithExtension'
import { CreateConnectorWizard } from './CreateConnectorWizard'
import AWSConnectorExtension from './AWSCOConnector/AWSConnectorExtension'
import css from './CreateConnectorWizard.module.scss'

export interface UseCreateConnectorModalProps {
  onSuccess?: (data?: ConnectorInfoDTO) => void
  onClose?: () => void
  permission?: 'CE' | 'CO'
}

export interface UseCreateConnectorModalReturn {
  openConnectorModal: (
    isEditMode: boolean,
    type: ConnectorInfoDTO['type'],
    connectorInfo: ConnectorInfoDTO | void,
    modalProps?: IDialogProps
  ) => void
  hideConnectorModal: () => void
}

const useCreateConnectorModal = (props: UseCreateConnectorModalProps): UseCreateConnectorModalReturn => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [type, setType] = useState(Connectors.KUBERNETES_CLUSTER)
  const [connectorInfo, setConnectorInfo] = useState<ConnectorInfoDTO | void>()
  const [modalProps, setModalProps] = useState<IDialogProps>({
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 'auto',
      // minHeight: 640,
      borderLeft: 0,
      paddingBottom: 0,
      // position: 'relative',
      overflow: 'hidden'
    }
  })
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const handleSuccess = (data?: ConnectorInfoDTO): void => {
    props.onSuccess?.(data)
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <DialogWithExtension
        modalProps={modalProps}
        renderExtension={<AWSConnectorExtension />}
        dialogStyles={{ height: 740 }}
      >
        <CreateConnectorWizard
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          type={type}
          isEditMode={isEditMode}
          connectorInfo={connectorInfo}
          onSuccess={data => {
            props.onClose?.()
            hideModal()
            handleSuccess(data)
          }}
          hideLightModal={hideModal}
          permission={props.permission}
        />
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
        {/* {({ triggerExtension }) => (
          <>
          </>
        )} */}
      </DialogWithExtension>
    ),
    [type, isEditMode, connectorInfo]
  )

  return {
    openConnectorModal: (
      isEditing: boolean,
      connectorType: ConnectorInfoDTO['type'],
      connectorDetails: ConnectorInfoDTO | void,
      _modalProps?: IDialogProps | undefined
    ) => {
      setConnectorInfo(connectorDetails)
      setIsEditMode(isEditing)
      setType(connectorType)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideConnectorModal: hideModal
  }
}

export default useCreateConnectorModal
