import React from 'react'
import { isEmpty } from 'lodash-es'
import moment from 'moment'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import type { LogAnalysisRadarChartListDTO, LogFeedback } from 'services/cv'
import { useStrings } from 'framework/strings'
import RiskItemIndicator from '../../../UpdateEventPreferenceDrawer/component/component/RiskItemIndicator'
import { getRiskDisplayText } from '../LogAnalysisRiskDisplayUtils'
import { RiskItemDisplayName } from '../../../UpdateEventPreferenceDrawer/UpdateEventPreferenceDrawer.utils'
import css from './LogAnalysisRiskDisplayTooltip.module.scss'

interface LogAnalysisRiskDisplayTooltipProps {
  risk?: LogAnalysisRadarChartListDTO['risk']
  feedback?: LogFeedback
}

export default function LogAnalysisRiskDisplayTooltip(props: LogAnalysisRiskDisplayTooltipProps): JSX.Element | null {
  const { risk, feedback } = props

  const { getString } = useStrings()

  if (isEmpty(feedback) || !feedback) {
    return (
      <Container className={css.logAnalysisRiskDisplayTooltip}>
        <Text data-testid="logAnalysisRiskTooltip-text">{getRiskDisplayText(risk, getString)}</Text>
      </Container>
    )
  }

  const { description, feedbackScore, updatedby, updatedAt } = feedback

  return (
    <Container className={css.feedbackTooltip}>
      <Container className={css.feedbackTooltipRiskDisplay}>
        <Text margin={{ right: 'small' }}>{getString('cv.logs.feedbackApplied')}: &nbsp;</Text>
        {feedbackScore && (
          <Container className={css.feedbackTooltipRiskIndicator}>
            <RiskItemIndicator risk={feedbackScore} isSmall />
            <Text data-testid="logAnalysisRiskTooltip-feedbackScore">
              {getString(RiskItemDisplayName[feedbackScore])}
            </Text>
          </Container>
        )}
      </Container>
      <Container className={css.feedbackTooltipDetails}>
        <Icon margin={{ right: 'small' }} name="chat" />
        <Layout.Vertical className={css.feedbackTooltipDescription}>
          <Text>{description}</Text>
          <Text data-testid="logAnalysisRiskTooltip-updatedAt">
            {updatedby} {getString('common.on')} {moment(updatedAt).format('L h:mm A')}
          </Text>
        </Layout.Vertical>
      </Container>
    </Container>
  )
}
