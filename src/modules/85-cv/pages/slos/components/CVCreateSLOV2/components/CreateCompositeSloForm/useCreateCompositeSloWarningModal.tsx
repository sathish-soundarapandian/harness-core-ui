/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikHelpers } from 'formik'
import { Button, Container, Dialog, Heading, Text, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { HideModal, ShowModal, useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import sloReviewChange from '@cv/assets/sloReviewChange.svg'
import type { SLOV2Form } from '../../CVCreateSLOV2.types'
import { getOkAndCancelActions, getWarningModalProps } from './CreateCompositeSloForm.utils'
import { WarningModalType } from './CreateCompositeSloForm.constant'
import css from './CreateCompositeSloForm.module.scss'

export interface UseCreateCompositeSloWarningModalProps {
  handleRedirect: () => void
  onChange: FormikHelpers<SLOV2Form>['setValues']
  prevStepData: React.MutableRefObject<SLOV2Form | null | undefined>
}

function useCreateCompositeSloWarningModal({
  onChange,
  prevStepData,
  handleRedirect
}: UseCreateCompositeSloWarningModalProps): ShowModal[] {
  const { getString } = useStrings()

  const ModalContent = ({ onClose, type }: { onClose: HideModal; type: WarningModalType }) => {
    const okAndCancelActions = getOkAndCancelActions({
      type,
      onClose,
      onChange,
      prevStepData,
      handleRedirect
    })
    const { modalTitle, modalMessage, onClickOk, onClickCancel } = getWarningModalProps({
      type,
      getString,
      okAndCancelActions
    })

    return (
      <Dialog
        isOpen={true}
        usePortal={true}
        autoFocus={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        enforceFocus={false}
        className={css.warningModal}
        onClose={onClose}
      >
        <Layout.Vertical>
          <Layout.Horizontal>
            <Container width="70%" padding={{ right: 'large' }}>
              <Heading level={2} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxlarge' }}>
                {modalTitle}
              </Heading>
              <Text color={Color.GREY_600} font={{ weight: 'light' }} style={{ lineHeight: 'var(--spacing-xlarge)' }}>
                {modalMessage}
              </Text>
            </Container>
            <Container margin={{ top: 'small' }}>
              <img width="170" src={sloReviewChange} />
            </Container>
          </Layout.Horizontal>

          <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'xlarge' }}>
            <Button text={getString('common.ok')} onClick={onClickOk} intent="primary" />
            <Button text={getString('cancel')} onClick={onClickCancel} />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    )
  }

  const [openSaveCancelModal, closeSaveCancelModal] = useModalHook(
    () => <ModalContent onClose={closeSaveCancelModal} type={WarningModalType.SAVE_CHANGES} />,
    []
  )

  const [openPeriodUpdateModal, closePeriodUpdateModal] = useModalHook(
    () => <ModalContent onClose={closePeriodUpdateModal} type={WarningModalType.PERIOD_TYPE} />,
    []
  )

  const [openEvaluationTypeUpdateModal, closeEvaluationTypeUpdateModal] = useModalHook(
    () => <ModalContent onClose={closeEvaluationTypeUpdateModal} type={WarningModalType.EVALUATION_TYPE} />,
    []
  )

  return [openSaveCancelModal, openPeriodUpdateModal, openEvaluationTypeUpdateModal]
}

export default useCreateCompositeSloWarningModal
