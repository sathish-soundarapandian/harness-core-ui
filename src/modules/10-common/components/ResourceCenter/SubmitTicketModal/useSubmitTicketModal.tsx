/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Dialog } from '@blueprintjs/core'
import { StepWizard, Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import React from 'react'
import { SubmitTicketModalStepTwo } from './SubmitTicketModalSteps/SubmitTicketModalStepTwo'
import { SubmitTicketModalStepThree } from './SubmitTicketModalSteps/SubmitTicketModalStepThree'
import { resultList, searchBox } from './Controllers/Controllers'
import css from './SubmitTicketModal.module.scss'

export const useSubmitTicketModal = () => {
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog isOpen enforceFocus={false} onClose={hideModal} className={css.submitTicketWizard}>
        <StepWizard initialStep={1}>
          <SubmitTicketModalStepTwo
            name="Ticket Subject"
            stepName="Ticket Subject"
            searchBoxController={searchBox}
            resultListController={resultList}
          />
          <SubmitTicketModalStepThree name="Ticket Details" stepName="Ticket Details" onCloseHandler={hideModal} />
        </StepWizard>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    )
  })

  return {
    showModal,
    hideModal
  }
}
