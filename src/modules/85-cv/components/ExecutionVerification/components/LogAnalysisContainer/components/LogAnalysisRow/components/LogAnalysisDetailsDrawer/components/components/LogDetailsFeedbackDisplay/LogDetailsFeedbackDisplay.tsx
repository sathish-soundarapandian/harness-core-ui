import React from 'react'
import { Container } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import type { LogFeedback } from 'services/cv'
import FeedbackDetailsDisplay from './FeedbackDetailsDisplay'
import css from './LogDetailsFeedbackDisplay.module.scss'

interface LogDetailsFeedbackDisplayProps {
  feedback?: LogFeedback
  feedbackApplied?: LogFeedback
}

export default function LogDetailsFeedbackDisplay({
  feedback,
  feedbackApplied
}: LogDetailsFeedbackDisplayProps): JSX.Element | null {
  if (isEmpty(feedback) && isEmpty(feedbackApplied)) {
    return null
  }

  const showUpdatedFeedback = feedback?.feedbackScore !== feedbackApplied?.feedbackScore

  return (
    <Container className={css.logDetailsContainer}>
      <FeedbackDetailsDisplay feedbackDetails={feedbackApplied} />
      {showUpdatedFeedback && (
        <FeedbackDetailsDisplay
          feedbackDetails={feedback}
          isUpdatedFeedback
          isBothFeedbacksPresent={!isEmpty(feedback) && !isEmpty(feedbackApplied)}
        />
      )}
    </Container>
  )
}
