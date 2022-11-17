/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'

let mockData: any = null
const useCreateConnectorModalMock = (data: any) => {
  mockData = data
  return useCreateConnectorModal
}
const useCreateConnectorModal = (props: any): any => {
  const [modalProps] = useState<IDialogProps>({
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 'auto',
      minWidth: 1175,
      minHeight: 640,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'auto'
    }
  })

  const handleSuccess = (data?: any): void => {
    props.onSuccess?.(data)
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <Button
          text="save"
          onClick={() => {
            handleSuccess(mockData)
          }}
        />
      </Dialog>
    ),
    []
  )

  return {
    openConnectorModal: (_modalProps?: IDialogProps) => {
      showModal()
    },
    hideConnectorModal: hideModal
  }
}

export default useCreateConnectorModalMock
