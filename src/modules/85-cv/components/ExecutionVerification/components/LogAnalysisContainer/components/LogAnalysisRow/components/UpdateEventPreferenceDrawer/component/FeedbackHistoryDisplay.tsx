import React from 'react'
import moment from 'moment'
import { isEmpty } from 'lodash-es'
import { Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { LogFeedbackHistory } from 'services/cv'
import CommonFeedbackItem from './CommonFeedbackItem'
import RiskItemIndicator from './component/RiskItemIndicator'
import { RiskItemDisplayName } from '../UpdateEventPreferenceDrawer.utils'
import css from '../UpdateEventPreferenceDrawer.module.scss'

interface FeedbackHistoryDisplayProps {
  feedbacks?: LogFeedbackHistory[]
}

export default function FeedbackHistoryDisplay({ feedbacks }: FeedbackHistoryDisplayProps): JSX.Element | null {
  const { getString } = useStrings()
  if (isEmpty(feedbacks)) {
    return null
  }

  return (
    <>
      {feedbacks?.map(feedback => {
        const { updatedBy, logFeedback } = feedback

        if (!logFeedback) {
          return null
        }

        const { feedbackScore, updatedAt, description } = logFeedback

        return (
          <Layout.Vertical className={css.feedbackItem} key={updatedAt}>
            <Layout.Horizontal className={css.feedbackData}>
              <Text className={css.feedbackDataLabel}>{getString('cv.logs.eventPriority')}</Text>
              {feedbackScore && (
                <Layout.Horizontal className={css.feedbackDataRisk}>
                  <RiskItemIndicator risk={feedbackScore} isSmall />
                  <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_700}>
                    {getString(RiskItemDisplayName[feedbackScore])}
                  </Text>
                </Layout.Horizontal>
              )}
            </Layout.Horizontal>
            <CommonFeedbackItem label={getString('reason')} value={description} />
            <CommonFeedbackItem
              label={getString('cv.logs.updatedBy')}
              value={`${updatedBy} ${getString('common.on')} ${moment(updatedAt).format('L h:mm A')}`}
            />
          </Layout.Vertical>
        )
      })}
    </>
  )
}
