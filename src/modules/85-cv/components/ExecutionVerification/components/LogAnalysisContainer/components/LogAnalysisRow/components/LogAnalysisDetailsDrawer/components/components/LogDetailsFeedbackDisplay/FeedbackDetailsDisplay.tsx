import React from 'react'
import { Container, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import moment from 'moment'
import type { LogFeedback } from 'services/cv'
import RiskItemIndicator from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRow/components/UpdateEventPreferenceDrawer/component/component/RiskItemIndicator'
import { useStrings } from 'framework/strings'
import {
  FeedbackScore,
  RiskItemDisplayName
} from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRow/components/UpdateEventPreferenceDrawer/UpdateEventPreferenceDrawer.utils'
import css from './LogDetailsFeedbackDisplay.module.scss'

interface FeedbackDetailsDisplayProps {
  feedbackDetails?: LogFeedback
  isUpdatedFeedback?: boolean
  isBothFeedbacksPresent?: boolean
}

export default function FeedbackDetailsDisplay({
  feedbackDetails,
  isUpdatedFeedback,
  isBothFeedbacksPresent
}: FeedbackDetailsDisplayProps): JSX.Element | null {
  const { getString } = useStrings()

  if (isEmpty(feedbackDetails) || !feedbackDetails) {
    return null
  }

  const { feedbackScore, updatedBy, updatedAt } = feedbackDetails

  const userMessage = isUpdatedFeedback
    ? getString('cv.logs.feedbackUpdatedMessage')
    : getString('cv.logs.feedbackAppliedMessage')

  return (
    <Layout.Vertical
      padding="small"
      spacing="small"
      className={cx({
        [css.updatedFeedback]: isUpdatedFeedback,
        [css.updatedFeedbackborder]: isUpdatedFeedback && isBothFeedbacksPresent
      })}
      data-testid={isUpdatedFeedback ? 'updatedFeedbackDisplay' : 'appliedFeedbackDisplay'}
    >
      <Container className={css.feedbackDetails}>
        <RiskItemIndicator isSmall risk={feedbackScore} />
        <Text
          data-testid={isUpdatedFeedback ? 'updatedFeedbackRisk' : 'appliedFeedbackRisk'}
          margin={{ right: 'small' }}
          font={{ variation: FontVariation.BODY2 }}
        >
          {getString(RiskItemDisplayName[feedbackScore as FeedbackScore])}
        </Text>
        <Text
          data-testid={isUpdatedFeedback ? 'updatedFeedbackDetails' : 'appliedFeedbackDetails'}
          font={{ variation: FontVariation.BODY }}
        >{` ${getString('cv.logs.updatedBy')} ${updatedBy} ${getString('common.on')} ${moment(updatedAt).format(
          'L h:mm A'
        )}`}</Text>
      </Container>

      <Text
        data-testid={isUpdatedFeedback ? 'updatedFeedbackMessage' : 'appliedFeedbackMessage'}
        font={{ variation: FontVariation.BODY }}
        icon={isUpdatedFeedback ? 'info-message' : undefined}
        iconProps={{ margin: { right: 'small' } }}
      >
        {userMessage}
      </Text>
    </Layout.Vertical>
  )
}
