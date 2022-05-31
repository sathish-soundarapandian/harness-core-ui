/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import type { Module } from 'framework/types/ModuleName'
import { Editions, SubscribeViews } from '@common/constants/SubscriptionTypes'
import { CostCalculator } from '../components/CostCalculator/CostCalculator'
import { FinalReview } from '../components/FinalReview/FinalReview'
import { Success } from '../components/Success/Success'
import { BillingInfo } from '../components/BillingInfo/BillingInfo'
import css from './useSubscriptionModal.module.scss'

interface UseSubscribeModalReturns {
  openSubscribeModal: () => void
  closeSubscribeModal: () => void
}

interface UseSubscribeModalProps {
  module: Module
  newPlan: Editions
}

const View = ({ module, newPlan }: UseSubscribeModalProps): React.ReactElement => {
  const [view, setView] = useState(SubscribeViews.CALCULATE)

  return (
    <div>
      {view === SubscribeViews.CALCULATE && <CostCalculator module={module} setView={setView} newPlan={newPlan} />}
      {view === SubscribeViews.BILLINGINFO && <BillingInfo module={module} setView={setView} />}
      {view === SubscribeViews.FINALREVIEW && <FinalReview module={module} setView={setView} plan={newPlan} />}
      {view === SubscribeViews.SUCCESS && <Success module={module} />}
    </div>
  )
}

export const useSubscribeModal = ({ module, newPlan }: UseSubscribeModalProps): UseSubscribeModalReturns => {
  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        onClose={hideModal}
        isOpen
        enforceFocus={false}
        className={cx(css.dialog, Classes.DIALOG)}
        title=""
        isCloseButtonShown
      >
        <View module={module} newPlan={newPlan} />
      </Dialog>
    ),
    []
  )

  return {
    openSubscribeModal: openModal,
    closeSubscribeModal: hideModal
  }
}
