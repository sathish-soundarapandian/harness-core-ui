/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Dialog } from '@blueprintjs/core'
import { StepWizard } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import React from 'react'
import css from './SubmitTicketModal.module.scss'

// render step wizard steps in place of div

export const useSubmitTicketModal = () => {
  const onStepChange = () => {
    // handle step change here
  }
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen
        enforceFocus={false}
        title="Submit a ticket"
        onClose={hideModal}
        className={css.submitTicketWizard}
      >
        <StepWizard subtitle={'Subtitle'} onStepChange={onStepChange} initialStep={1}>
          <div></div>
          <div></div>
        </StepWizard>
      </Dialog>
    )
  })

  return {
    showModal,
    hideModal
  }
}
