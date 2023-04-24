import React from 'react'
import { Container, Text } from '@harness/uicore'
import type { LogFeedback } from 'services/cv'
import { useStrings } from 'framework/strings'
import RiskItemIndicator from '../../../UpdateEventPreferenceDrawer/component/component/RiskItemIndicator'
import LogAnalysisRiskDisplayTooltip from './LogAnalysisRiskDisplayTooltip'
import css from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRow/LogAnalysisRow.module.scss'

interface LogAnalysisRowFeedbackDisplay {
  feedbackApplied?: LogFeedback
}

export function LogAnalysisRowFeedbackDisplay({ feedbackApplied }: LogAnalysisRowFeedbackDisplay): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container data-testid="feedbackContainer" className={css.rowAppliedFeedbackIndicator}>
      <RiskItemIndicator isSmall risk={feedbackApplied?.feedbackScore} />
      <Text
        tooltip={<LogAnalysisRiskDisplayTooltip feedback={feedbackApplied} />}
        tooltipProps={{ isDark: true }}
        className={css.rowAppliedFeedbackIndicatorText}
      >
        {getString('cv.logs.feedbackApplied')}
      </Text>
    </Container>
  )
}
