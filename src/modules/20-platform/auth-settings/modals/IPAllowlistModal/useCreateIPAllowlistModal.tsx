/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'

import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import type { IpAllowlistConfigResponse } from '@harnessio/react-ng-manager-client'

import CreateIPAllowlistWizard from '@auth-settings/components/CreateIPAllowlist/CreateIPAllowlistWizard'
import css from './useCreateIPAllowlistModal.module.scss'

export interface UseCreateIPAllowlistModalProps {
  onClose?: () => void
}

export interface UseCreateIPAllowlistModalReturn {
  openIPAllowlistModal: (
    isEditing: boolean,
    modalProps?: IDialogProps,
    ipAllowlistData?: IpAllowlistConfigResponse
  ) => void
  closeIPAllowlistModal: () => void
}

const useCreateIPAllowlistModal = (
  useCreateIPAllowlistModalProps?: UseCreateIPAllowlistModalProps
): UseCreateIPAllowlistModalReturn => {
  const [ipAllowlistData, setIPAllowlistData] = useState<IpAllowlistConfigResponse | undefined>()
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [modalProps, setModalProps] = useState<IDialogProps>({
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 1268,
      height: '100%',
      minHeight: 'auto',
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })

  const [showModal, hideModal] = useModalHook(() => {
    const onClose: () => void = () => {
      useCreateIPAllowlistModalProps?.onClose?.()
      hideModal()
    }
    return (
      <Dialog {...modalProps} onClose={onClose}>
        <CreateIPAllowlistWizard
          onClose={onClose}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          data={ipAllowlistData}
        />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [isEditMode, ipAllowlistData, modalProps])

  return {
    openIPAllowlistModal: (
      isEditing: boolean,
      _modalProps?: IDialogProps | undefined,
      _ipAllowlistData?: IpAllowlistConfigResponse
    ) => {
      setIsEditMode(isEditing)
      setIPAllowlistData(_ipAllowlistData)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    closeIPAllowlistModal: hideModal
  }
}

export default useCreateIPAllowlistModal
