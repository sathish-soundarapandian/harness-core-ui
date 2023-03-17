import React, { useCallback, useEffect, useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Drawer } from '@blueprintjs/core'
import { Accordion, Button, Container, Heading, Icon, PageError } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useGetFeedbackHistory } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { LogAnalysisRowData } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import { DrawerProps } from '../LogAnalysisDetailsDrawer/LogAnalysisDetailsDrawer.constants'
import LogsMetaData from '../LogAnalysisDetailsDrawer/components/LogsMetaData'
import UpdateEventPreferenceDrawerForm from './UpdateEventPreferenceDrawerForm'
import FeedbackHistoryDisplay from './component/FeedbackHistoryDisplay'
import style from '../LogAnalysisDetailsDrawer/LogAnalysisDetailsDrawer.module.scss'
import css from './UpdateEventPreferenceDrawer.module.scss'

export interface UpdateEventPreferenceDrawerProps {
  rowData: LogAnalysisRowData
  onHide: (isCallAPI?: boolean) => void
  activityId: string
}

export default function UpdateEventPreferenceDrawer(props: UpdateEventPreferenceDrawerProps): JSX.Element | null {
  const { rowData, onHide, activityId } = props || {}
  const { clusterType, count, riskStatus, feedback, clusterId } = rowData

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const { getString } = useStrings()

  const [isOpen, setOpen] = useState(true)

  const onHideCallback = useCallback(
    (isCallAPI?: boolean) => {
      setOpen(false)
      onHide(isCallAPI)
    },
    [onHide]
  )

  const {
    data: feedbackHistory,
    loading: feedbackHistoryLoading,
    error: feedbackHistoryError,
    refetch: fetchFeedbackHistory
  } = useGetFeedbackHistory({
    accountIdentifier: accountId,
    logFeedbackId: feedback?.feedbackId || '',
    projectIdentifier,
    orgIdentifier,
    lazy: true
  })

  const logFeedbackHistoryCall = useCallback(() => {
    if (feedback?.feedbackId) {
      fetchFeedbackHistory({
        pathParams: {
          accountIdentifier: accountId,
          logFeedbackId: feedback.feedbackId,
          projectIdentifier,
          orgIdentifier
        }
      })
    }
  }, [accountId, feedback?.feedbackId, orgIdentifier, projectIdentifier])

  useEffect(() => {
    logFeedbackHistoryCall()
  }, [feedback?.feedbackId])

  if (isEmpty(rowData)) {
    return null
  }

  const getFeedbackHistoryContent = (): JSX.Element | null => {
    const isFeedbackHistoryPresent =
      !isEmpty(feedbackHistory?.resource) && !feedbackHistoryLoading && !feedbackHistoryError

    if (feedbackHistoryLoading) {
      return (
        <Container className={style.messageContainer} data-testid="updateEventPreferenceDrawer_loader">
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    }

    if (feedbackHistoryError && isEmpty(feedbackHistory?.resource)) {
      return (
        <Container className={style.messageContainer} data-testid="updateEventPreferenceDrawer_error">
          <PageError message={getErrorMessage(feedbackHistoryError)} onClick={logFeedbackHistoryCall} />
        </Container>
      )
    }

    if (isFeedbackHistoryPresent) {
      return (
        <Container padding="medium" data-testid="feedbackHistory" className={css.feedbackSection}>
          <Accordion>
            <Accordion.Panel
              id="feedbackHistory"
              summary={getString('cv.logs.feedbackHistory')}
              details={<FeedbackHistoryDisplay feedbacks={feedbackHistory?.resource} />}
            />
          </Accordion>
        </Container>
      )
    }

    return null
  }

  const getDrawerContent = (): JSX.Element => {
    return (
      <>
        <Container className={css.formSection} data-testid="updateEventPreferenceDrawer-Container">
          <Container className={style.headingContainer} data-testid="updateEventPreferenceDrawer">
            <Heading level={2} font={{ variation: FontVariation.H4 }}>
              {getString('pipeline.verification.logs.updateEventPreference')}
            </Heading>
          </Container>

          <Container padding="large">
            <LogsMetaData activityType={clusterType} count={count} risk={riskStatus} />

            <UpdateEventPreferenceDrawerForm
              onHideCallback={onHideCallback}
              feedback={feedback}
              activityId={activityId}
              clusterId={clusterId}
            />
          </Container>
        </Container>
        {getFeedbackHistoryContent()}
      </>
    )
  }

  return (
    <>
      <Drawer
        {...DrawerProps}
        size="50%"
        isOpen={isOpen}
        onClose={() => onHideCallback()}
        className={cx(style.main, css.updatePreferenceDrawer)}
      >
        {getDrawerContent()}
      </Drawer>
      <Button
        data-testid="UpdateEventDrawerClose_button_top"
        minimal
        className={cx(style.almostFullScreenCloseBtn, css.updatePreferenceDrawerCloseBtn)}
        icon="cross"
        withoutBoxShadow
        onClick={() => onHideCallback()}
      />
    </>
  )
}
