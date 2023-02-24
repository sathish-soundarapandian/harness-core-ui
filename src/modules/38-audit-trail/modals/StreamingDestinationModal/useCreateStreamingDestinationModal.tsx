/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'

import type { StreamingDestinationAggregateDto } from '@harnessio/react-audit-service-client'
import { CreateStreamingDestinationWizard } from '@audit-trail/components/CreateStreamingDestination/CreateStreamingDestinationWizard'
import css from './useCreateStreamingDestinationModal.module.scss'

export interface UseCreateStreamingDestinationModalProps {
  onClose?: () => void
}

export interface UseCreateStreamingDestinationModalReturn {
  openStreamingDestinationModal: (
    isEditing: boolean,
    modalProps?: IDialogProps,
    streamingDestinationAggregateData?: StreamingDestinationAggregateDto
  ) => void
  closeStreamingDestinationModal: () => void
}

const useCreateStreamingDestinationModal = (
  useCreateStreamingDestinationModalProps?: UseCreateStreamingDestinationModalProps
): UseCreateStreamingDestinationModalReturn => {
  const [streamingDestinationAggregateData, setStreamingDestinationAggregateData] = useState<
    StreamingDestinationAggregateDto | undefined
  >()
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
      useCreateStreamingDestinationModalProps?.onClose?.()
      hideModal()
    }
    return (
      <Dialog {...modalProps} onClose={onClose}>
        <CreateStreamingDestinationWizard
          onClose={onClose}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          data={streamingDestinationAggregateData}
        />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [isEditMode, streamingDestinationAggregateData, modalProps])
  return {
    openStreamingDestinationModal: (
      isEditing: boolean,
      _modalProps?: IDialogProps | undefined,
      _streamingDestinationAggregateData?: StreamingDestinationAggregateDto
    ) => {
      setIsEditMode(isEditing)
      setStreamingDestinationAggregateData(_streamingDestinationAggregateData)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    closeStreamingDestinationModal: hideModal
  }
}

export default useCreateStreamingDestinationModal
