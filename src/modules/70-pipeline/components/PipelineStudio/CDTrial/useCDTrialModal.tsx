/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Dialog } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'

import cx from 'classnames'

import { TrialModalTemplate } from '@pipeline/components/TrialModalTemplate/TrialModalTemplate'
import { useGetCommunity } from '@common/utils/utils'
import type { UseTrialModalProps, UseTrialModalReturns } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import { useGetFormPropsByTrialType } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import cdImage from './cd.png'
import css from './useCDTrialModal.module.scss'

interface CDTrialTemplateData {
  children: React.ReactElement
}

function CDTrialTemplate({ children }: CDTrialTemplateData): React.ReactElement {
  return (
    <TrialModalTemplate imgSrc={cdImage} hideTrialBadge={useGetCommunity()}>
      {children}
    </TrialModalTemplate>
  )
}

function CDTrial({ trialType, actionProps, onCloseModal }: UseTrialModalProps): React.ReactElement {
  const { child } = useGetFormPropsByTrialType({
    trialType,
    actionProps,
    module: 'cd',
    onCloseModal
  })

  return <CDTrialTemplate>{child}</CDTrialTemplate>
}

function CDTrialDialog({ actionProps, trialType, onCloseModal }: UseTrialModalProps): React.ReactElement {
  return (
    <Dialog isOpen={true} enforceFocus={false} onClose={onCloseModal} className={cx(css.dialog, css.cdTrial)}>
      <CDTrial trialType={trialType} actionProps={actionProps} onCloseModal={onCloseModal} />
    </Dialog>
  )
}

export const getCDTrialDialog = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): React.ReactElement => (
  <CDTrialDialog actionProps={actionProps} trialType={trialType} onCloseModal={onCloseModal} />
)

export const useCDTrialModal = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): UseTrialModalReturns => {
  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      onCloseModal?.()
      hideModal()
    }
    return <CDTrialDialog actionProps={actionProps} trialType={trialType} onCloseModal={onClose} />
  }, [])

  return {
    openTrialModal: showModal,
    closeTrialModal: hideModal
  }
}
