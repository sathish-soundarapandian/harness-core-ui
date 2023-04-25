import React from 'react'
import { Container, Layout } from '@harness/uicore'
import type { LogFeedback, TicketResponseDto } from 'services/cv'
import { LogAnalysisRowFeedbackDisplay } from './components/LogAnalysisRowFeedbackDisplay'
import { LogAnalysisRowTicketDisplay } from './components/LogAnalysisRowTicketDisplay'
import css from '../../../LogAnalysisRow.module.scss'

interface LogAnalysisRowMetadataProps {
  isFeedbackTicketPresent: boolean
  isFeedbackApplied: boolean
  feedbackApplied?: LogFeedback
  ticketDetails?: TicketResponseDto
}

export const LogAnalysisRowMetadata = ({
  feedbackApplied,
  ticketDetails,
  isFeedbackApplied,
  isFeedbackTicketPresent
}: LogAnalysisRowMetadataProps): JSX.Element | null => {
  if (!isFeedbackApplied && !isFeedbackTicketPresent) {
    return null
  }

  return (
    <Container padding={{ left: 'medium', right: 'medium' }}>
      <Layout.Horizontal className={css.logsMetadataHolder}>
        {isFeedbackApplied && <LogAnalysisRowFeedbackDisplay feedbackApplied={feedbackApplied} />}
        {isFeedbackTicketPresent && <LogAnalysisRowTicketDisplay ticketDetails={ticketDetails} />}
      </Layout.Horizontal>
    </Container>
  )
}
