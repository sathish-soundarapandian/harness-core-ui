/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikHelpers } from 'formik'
import { Button, Color, Container, Dialog, FontVariation, Heading, Text, Layout } from '@harness/uicore'
import { ShowModal, useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import sloReviewChange from '@cv/assets/sloReviewChange.svg'
import type { SLOV2Form } from '../../CVCreateSLOV2.types'
import css from './CreateCompositeSloForm.module.scss'

interface UseCreateCompositeSloWarningModalProps {
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

  const [openSaveCancelModal, closeSaveCancelModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        usePortal={true}
        autoFocus={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        enforceFocus={false}
        className={css.warningModal}
        onClose={closeSaveCancelModal}
      >
        <Layout.Vertical>
          <Layout.Horizontal>
            <Container width="70%" padding={{ right: 'large' }}>
              <Heading level={2} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxlarge' }}>
                {getString('unsavedChanges')}
              </Heading>
              <Text color={Color.GREY_600} font={{ weight: 'light' }} style={{ lineHeight: 'var(--spacing-xlarge)' }}>
                {getString('common.unsavedChangesLong')}
              </Text>
            </Container>
            <Container margin={{ top: 'small' }}>
              <img width="170" src={sloReviewChange} />
            </Container>
          </Layout.Horizontal>

          <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'xlarge' }}>
            <Button
              text={getString('common.ok')}
              onClick={() => {
                handleRedirect()
              }}
              intent="primary"
            />
            <Button
              text={getString('cancel')}
              onClick={() => {
                closeSaveCancelModal()
              }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    ),
    []
  )

  const [openPeriodUpdateModal, closePeriodUpdateModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        usePortal={true}
        autoFocus={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        enforceFocus={false}
        style={{
          width: 600,
          borderLeft: 0,
          paddingBottom: 0,
          paddingTop: 'large',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClose={closePeriodUpdateModal}
      >
        <Layout.Vertical>
          <Layout.Horizontal>
            <Container width="70%" padding={{ right: 'large' }}>
              <Heading level={2} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxlarge' }}>
                {getString('cv.CompositeSLO.PeriodChangeWarning.title')}
              </Heading>
              <Text color={Color.GREY_600} font={{ weight: 'light' }} style={{ lineHeight: 'var(--spacing-xlarge)' }}>
                {getString('cv.CompositeSLO.PeriodChangeWarning.message')}
              </Text>
            </Container>
            <Container margin={{ top: 'small' }}>
              <img width="170" src={sloReviewChange} />
            </Container>
          </Layout.Horizontal>

          <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'xlarge' }}>
            <Button
              text={getString('common.ok')}
              onClick={() => {
                closePeriodUpdateModal()
              }}
              intent="primary"
            />
            <Button
              text={getString('cancel')}
              onClick={() => {
                onChange({ ...prevStepData?.current } as SLOV2Form)
                closePeriodUpdateModal()
              }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    ),
    []
  )

  return [openSaveCancelModal, openPeriodUpdateModal]
}

export default useCreateCompositeSloWarningModal
