/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import type { AccessPoint } from 'services/lw'
import CreateAccessPointDialogScreens from './CreateAccessPointDialogSteps'

interface UseCreateAccessPointDialogProps {
  onAccessPointSave: (ap: AccessPoint) => void
}

const modalPropsLight: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 860,
    padding: 40,
    position: 'relative',
    minHeight: 500
  }
}

const useCreateAccessPointDialog = (props: UseCreateAccessPointDialogProps, deps?: any[]) => {
  const onAccessPointSave = (savedLb: AccessPoint) => {
    props.onAccessPointSave(savedLb)
  }
  const [createAccessPointModal, hidecreateAccessPointModal] = useModalHook(
    () => (
      <Dialog onClose={hidecreateAccessPointModal} {...modalPropsLight} canOutsideClickClose={false}>
        <CreateAccessPointDialogScreens onCancel={hidecreateAccessPointModal} onSave={onAccessPointSave} />
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hidecreateAccessPointModal()
          }}
          style={{ position: 'absolute', right: 'var(--spacing-large)', top: 'var(--spacing-large)' }}
          data-testid={'close-instance-modal'}
        />
      </Dialog>
    ),
    [deps]
  )
  return {
    openCreateAccessPointModal: createAccessPointModal
  }
}

export default useCreateAccessPointDialog
