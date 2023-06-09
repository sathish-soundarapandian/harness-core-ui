import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Classes } from '@blueprintjs/core'
import { Button, ButtonVariation, Container, useToaster, Dialog, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import { useUpdateBaseline1, VerificationOverview } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { canShowPinBaselineConfirmationModal } from '../TestSummaryView/TestsSummaryView.utils'
import css from '../TestSummaryView/TestsSummaryView.module.scss'

interface PipelineBaselineProps {
  data: VerificationOverview | null
  activityId?: string
}

export default function PinBaslineButton(props: PipelineBaselineProps): JSX.Element {
  const { data, activityId } = props
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [isPinned, setIsPinned] = useState(Boolean(data?.baselineOverview?.baseline))

  const { showError } = useToaster()

  const { mutate: updateBaseline, error } = useUpdateBaseline1({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    verifyStepExecutionId: activityId as string
  })

  const { getString } = useStrings()

  const updatePinnedBaselineDetails = useCallback(async () => {
    setIsPinned((currentStatus: boolean) => !currentStatus)
    try {
      await updateBaseline({ baseline: !isPinned })
      hideModal()
    } catch {
      showError(getErrorMessage(error))
      setIsPinned((currentStatus: boolean) => !currentStatus)
    }
  }, [error, isPinned, showError, updateBaseline])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        title={getString('pipeline.verification.baselineMessages.pinModalTitle')}
        onClose={hideModal}
        enforceFocus={false}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <Text margin={{ bottom: 'large' }} font={{ variation: FontVariation.BODY2 }}>
          {getString('pipeline.verification.baselineMessages.pinModalMessage')}
        </Text>

        <Button
          data-testid="pinBaslineButton_confirmationButton"
          onClick={updatePinnedBaselineDetails}
          margin={{ right: 'medium' }}
          variation={ButtonVariation.PRIMARY}
        >
          {getString('pipeline.verification.baselineMessages.pinConfirmationButtonText')}
        </Button>
        <Button data-testid="pinBaslineButton_cancelButton" onClick={hideModal} variation={ButtonVariation.SECONDARY}>
          {getString('cancel')}
        </Button>
      </Dialog>
    ),
    [updatePinnedBaselineDetails]
  )

  const handlePinChange = useCallback(async () => {
    const currentBaseline = data?.baselineOverview?.baselineVerificationJobInstanceId
    if (canShowPinBaselineConfirmationModal({ isPinned, activityId, currentBaseline })) {
      showModal()
    } else {
      await updatePinnedBaselineDetails()
    }
  }, [
    activityId,
    data?.baselineOverview?.baselineVerificationJobInstanceId,
    isPinned,
    showModal,
    updatePinnedBaselineDetails
  ])

  const buttonText = isPinned
    ? getString('pipeline.verification.unpinBaseline')
    : getString('pipeline.verification.pinBaseline')

  return (
    <>
      <Container margin={{ bottom: 'medium' }}>
        <Button
          data-testid="pinBaselineButton"
          onClick={handlePinChange}
          icon="pin"
          variation={ButtonVariation.SECONDARY}
        >
          {buttonText}
        </Button>
      </Container>
    </>
  )
}
