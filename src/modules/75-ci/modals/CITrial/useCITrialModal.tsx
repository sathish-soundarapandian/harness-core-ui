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
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, TrialActions, PageNames } from '@common/constants/TrackingConstants'

import { TrialModalTemplate } from '@pipeline/components/TrialModalTemplate/TrialModalTemplate'
import type { UseTrialModalProps, UseTrialModalReturns } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import { useGetFormPropsByTrialType } from '@pipeline/components/TrialModalTemplate/trialModalUtils'
import ciImage from '../images/ci.png'

import css from './useCITrialModal.module.scss'

const CITrial: React.FC<UseTrialModalProps> = ({ trialType, actionProps, onCloseModal }) => {
  const { child } = useGetFormPropsByTrialType({
    trialType,
    actionProps,
    module: 'ci',
    onCloseModal
  })

  return <TrialModalTemplate imgSrc={ciImage}>{child}</TrialModalTemplate>
}

const CITrialDialog = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): React.ReactElement => {
  const { trackEvent } = useTelemetry()
  const handleClose = (): void => {
    onCloseModal?.()
    trackEvent(TrialActions.TrialModalPipelineSetupCancel, { category: Category.SIGNUP, module: 'ci' })
  }

  useTelemetry({
    pageName: PageNames.TrialSetupPipelineModal,
    properties: { module: 'ci' }
  })

  return (
    <Dialog isOpen={true} enforceFocus={false} onClose={handleClose} className={cx(css.dialog, css.ciTrial)}>
      <CITrial trialType={trialType} actionProps={actionProps} onCloseModal={handleClose} />
    </Dialog>
  )
}

export const getCITrialDialog = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): React.ReactElement => (
  <CITrialDialog actionProps={actionProps} trialType={trialType} onCloseModal={onCloseModal} />
)

export const useCITrialModal = ({ actionProps, trialType, onCloseModal }: UseTrialModalProps): UseTrialModalReturns => {
  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      onCloseModal?.()
      hideModal()
    }
    return <CITrialDialog actionProps={actionProps} trialType={trialType} onCloseModal={onClose} />
  })

  return {
    openTrialModal: showModal,
    closeTrialModal: hideModal
  }
}
