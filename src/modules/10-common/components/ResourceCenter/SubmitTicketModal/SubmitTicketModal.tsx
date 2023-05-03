/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { StepWizard, ModalDialog } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import { SubmitTicketModalStepOne } from './SubmitTicketModalSteps/SubmitTicketModalStepOne'
import { SubmitTicketModalStepTwo } from './SubmitTicketModalSteps/SubmitTicketModalStepTwo'
import { useCoveoControllers } from './Controllers/useCoveoControllers'
import css from './SubmitTicketModal.module.scss'

interface SubmitTicketModalProps {
  isOpen: boolean
  close(): void
}

export const SubmitTicketModal = ({ isOpen, close }: SubmitTicketModalProps): JSX.Element => {
  const { resultList, searchBox } = useCoveoControllers()
  const { getString } = useStrings()

  return (
    <ModalDialog
      isOpen={isOpen}
      enforceFocus={false}
      onClose={close}
      className={css.submitTicketWizard}
      height={830}
      width={1200}
    >
      <StepWizard
        initialStep={1}
        icon="pipeline-deploy"
        iconProps={{ size: 37, className: css.icon }}
        title={getString('common.resourceCenter.ticketmenu.submitTicket')}
      >
        <SubmitTicketModalStepOne
          name="Ticket Subject"
          stepName="Ticket Subject"
          searchBoxController={searchBox}
          resultListController={resultList}
        />
        <SubmitTicketModalStepTwo name="Ticket Details" stepName="Ticket Details" onCloseHandler={close} />
      </StepWizard>
    </ModalDialog>
  )
}
