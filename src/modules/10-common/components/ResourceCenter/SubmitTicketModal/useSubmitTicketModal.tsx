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
import { loadSearchAnalyticsActions, loadSearchActions } from '@coveo/headless'
import { SubmitTicketModalStepOne } from './SubmitTicketModalSteps/SubmitTickerModalStepOne'
import { SubmitTicketModalStepTwo } from './SubmitTicketModalSteps/SubmitTicketModalStepTwo'
import { SubmitTicketModalStepThree } from './SubmitTicketModalSteps/SubmitTicketModalStepThree'
import { headlessEngine } from './engine'
import { facet, pager, resultList, searchBox, sort } from './controllers/controllers'
import css from './SubmitTicketModal.module.scss'

export const useSubmitTicketModal = () => {
  const onStepChange = () => {
    // handle step change here
  }
  const changeIssueTypeHandler = (): void => {
    // will handle something here
  }
  // React.useEffect(() => {
  //   const { logInterfaceLoad } = loadSearchAnalyticsActions(headlessEngine)
  //   const { executeSearch } = loadSearchActions(headlessEngine)
  //   headlessEngine.dispatch(executeSearch(logInterfaceLoad()))
  // })
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog isOpen enforceFocus={false} onClose={hideModal} className={css.submitTicketWizard}>
        <StepWizard onStepChange={onStepChange} initialStep={1}>
          <SubmitTicketModalStepOne
            name="Select Issue Type"
            stepName="Select Issue Type"
            changeIssueTypeHandler={changeIssueTypeHandler}
          />
          <SubmitTicketModalStepTwo
            name="Deflection Step"
            stepName="Deflection Step"
            searchBoxController={searchBox}
            resultListController={resultList}
          />
          <SubmitTicketModalStepThree name="Ticket Details" stepName="Ticket Details" onCloseHandler={hideModal} />
        </StepWizard>
      </Dialog>
    )
  })

  return {
    showModal,
    hideModal
  }
}
