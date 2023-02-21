/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import cx from 'classnames'

import { TrialModalTemplate } from '@pipeline/components/TrialModalTemplate/TrialModalTemplate'
import { useGetCommunity } from '@common/utils/utils'
import type { UseTrialModalProps, UseTrialModalReturns } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import { useGetFormPropsByTrialType } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import stoImage from './sto.svg'
import css from './useSTOTrialModal.module.scss'

interface STOTrialTemplateData {
  children: React.ReactElement
}

function STOTrialTemplate({ children }: STOTrialTemplateData): React.ReactElement {
  return (
    <TrialModalTemplate imgSrc={stoImage} hideTrialBadge={useGetCommunity()}>
      {children}
    </TrialModalTemplate>
  )
}

function STOTrial({ trialType, actionProps, onCloseModal }: UseTrialModalProps): React.ReactElement {
  const { child } = useGetFormPropsByTrialType({
    trialType,
    actionProps,
    module: 'sto',
    onCloseModal
  })

  return <STOTrialTemplate>{child}</STOTrialTemplate>
}

function STOTrialDialog({ actionProps, trialType, onCloseModal }: UseTrialModalProps): React.ReactElement {
  return (
    <Dialog isOpen={true} enforceFocus={false} onClose={onCloseModal} className={cx(css.dialog, css.stoTrial)}>
      <STOTrial trialType={trialType} actionProps={actionProps} onCloseModal={onCloseModal} />
    </Dialog>
  )
}

export const getSTOTrialDialog = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): React.ReactElement => (
  <STOTrialDialog actionProps={actionProps} trialType={trialType} onCloseModal={onCloseModal} />
)

export const useSTOTrialModal = ({
  actionProps,
  trialType,
  onCloseModal
}: UseTrialModalProps): UseTrialModalReturns => {
  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      onCloseModal?.()
      hideModal()
    }
    return <STOTrialDialog actionProps={actionProps} trialType={trialType} onCloseModal={onClose} />
  }, [])

  return {
    openTrialModal: showModal,
    closeTrialModal: hideModal
  }
}
