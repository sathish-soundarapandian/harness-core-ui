/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Dialog } from '@blueprintjs/core'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import type { NgSmtpDTO } from 'services/cd-ng'
import CreateSmtpWizard from './CreateSmtpWizard'
import css from './useCreateSmtpModal.module.scss'

export interface UseCreateSmtpModalReturn {
  openCreateSmtpModal: (smtp?: NgSmtpDTO) => void
  closeCreateSmtpModal: () => void
}
export interface useCreateSmtpModalProps {
  onCloseModal: () => void
}

export enum Views {
  CREATE,
  EDIT
}

const useCreateSmtpModal = ({ onCloseModal }: useCreateSmtpModalProps): UseCreateSmtpModalReturn => {
  const [view, setView] = useState(Views.CREATE)
  const [smtpData, setSmtp] = useState<NgSmtpDTO>()
  const closeModal = (): void => {
    onCloseModal()
    hideModal()
  }
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        className={css.dialog}
        enforceFocus={false}
        isOpen={true}
        onClose={() => {
          setView(Views.CREATE)
          closeModal()
        }}
      >
        {view === Views.CREATE ? (
          <CreateSmtpWizard hideModal={closeModal} />
        ) : (
          <CreateSmtpWizard isEdit={true} detailsData={smtpData} hideModal={closeModal} />
        )}
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={closeModal} className={css.crossIcon} />
      </Dialog>
    ),
    [view, smtpData]
  )

  const open = useCallback(
    async (_smtpData?: NgSmtpDTO) => {
      if (_smtpData) {
        setSmtp(_smtpData)
        setView(Views.EDIT)
      } else {
        setView(Views.CREATE)
      }
      showModal()
    },
    [showModal]
  )
  return {
    openCreateSmtpModal: (smtp?: NgSmtpDTO) => open(smtp),
    closeCreateSmtpModal: closeModal
  }
}

export default useCreateSmtpModal
