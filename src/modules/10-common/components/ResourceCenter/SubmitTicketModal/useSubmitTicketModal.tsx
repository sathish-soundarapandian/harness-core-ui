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
import { SubmitTicketModalStepOne } from './SubmitTicketModalSteps/SubmitTickerModalStepOne'
import { SubmitTicketModalStepTwo } from './SubmitTicketModalSteps/SubmitTicketModalStepTwo'
import css from './SubmitTicketModal.module.scss'

export const useSubmitTicketModal = () => {
  const onStepChange = () => {
    // handle step change here
  }
  const changeIssueTypeHandler = (): void => {
    // will handle something here
  }
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog isOpen enforceFocus={false} onClose={hideModal} className={css.submitTicketWizard}>
        <StepWizard onStepChange={onStepChange} initialStep={1}>
          <SubmitTicketModalStepOne
            name="Select Issue Type"
            stepName="Select Issue Type"
            changeIssueTypeHandler={changeIssueTypeHandler}
          />
          <SubmitTicketModalStepTwo />
        </StepWizard>
      </Dialog>
    )
  })

  return {
    showModal,
    hideModal
  }
}
