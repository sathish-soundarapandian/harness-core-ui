/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Button, ButtonVariation } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, Classes } from '@blueprintjs/core'
import type { SourceCodeManagerDTO } from 'services/cd-ng'
import SourceCodeManagerForm from './views/SourceCodeManagerForm'
import css from './useSourceCodeManager.module.scss'

export interface UseSourceCodeModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
  initialValues?: SourceCodeManagerDTO
}

export interface UseSourceCodeModalReturn {
  openSourceCodeModal: () => void
  closeSourceCodeModal: () => void
}

export const useSourceCodeModal = ({ onSuccess, initialValues }: UseSourceCodeModalProps): UseSourceCodeModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <SourceCodeManagerForm
          initialValues={initialValues}
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          onClose={hideModal}
        />

        <Button
          variation={ButtonVariation.ICON}
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [onSuccess, initialValues]
  )

  return {
    openSourceCodeModal: showModal,
    closeSourceCodeModal: hideModal
  }
}
