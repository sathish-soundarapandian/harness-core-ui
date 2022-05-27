import React, { useState } from 'react'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import type { Module } from 'framework/types/ModuleName'
import { CostCalculator } from '../components/CostCalculator/CostCalculator'
import { SubscribeViews } from '../components/CostCalculator/CostCalculatorUtils'

interface UseSubscribeModalReturns {
  openSubscribeModal: () => void
  closeSubscribeModal: () => void
}

interface UseSubscribeModalProps {
  moduleType: Module
  onCloseModal?: () => void
}

const modalPropsLight: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  title: '',
  className: Classes.DIALOG,
  style: { width: 1056, height: 750 }
}

function getView(view: SubscribeViews): React.ReactElement {
  switch (view) {
    case SubscribeViews.REVIEW:
      return <CostCalculator />
    case SubscribeViews.SUCCESS:
      return <CostCalculator />
    case SubscribeViews.CALCULATE:
    default:
      return <CostCalculator />
  }
}

export const useSubscribeModal = ({ moduleType, onCloseModal }: UseSubscribeModalProps): UseSubscribeModalReturns => {
  const [view, setView] = useState(SubscribeViews.CALCULATE)

  const [openModal, hideModal] = useModalHook(() => (
    <Dialog onClose={hideModal} {...modalPropsLight}>
      {getView(view)}
    </Dialog>
  ))

  return {
    openSubscribeModal: openModal,
    closeSubscribeModal: hideModal
  }
}
