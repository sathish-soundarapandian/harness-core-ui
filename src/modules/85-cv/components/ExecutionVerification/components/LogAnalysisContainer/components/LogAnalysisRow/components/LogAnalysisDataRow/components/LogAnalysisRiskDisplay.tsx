import React from 'react'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { LogAnalysisRadarChartListDTO, LogFeedback } from 'services/cv'
import { getRiskDisplayText, getRiskIcon } from './LogAnalysisRiskDisplayUtils'
import LogAnalysisRiskDisplayTooltip from './components/LogAnalysisRiskDisplayTooltip'
import css from './LogAnalysisRiskDisplay.module.scss'

interface LogAnalysisRiskDisplayProps {
  risk?: LogAnalysisRadarChartListDTO['risk']
  showText?: boolean
  feedback?: LogFeedback
}

export default function LogAnalysisRiskDisplay({
  risk,
  feedback,
  showText = false
}: LogAnalysisRiskDisplayProps): JSX.Element | null {
  const { getString } = useStrings()
  if (!risk) {
    return null
  }

  return (
    <Container className={css.iconContainer}>
      <Text
        className={css.imageHolder}
        tooltip={showText ? undefined : <LogAnalysisRiskDisplayTooltip risk={risk} feedback={feedback} />}
        tooltipProps={{ isDark: true }}
        alwaysShowTooltip
      >
        <img src={getRiskIcon(risk)} style={{ width: 20 }} alt={risk} />
      </Text>
      {showText && (
        <Text color={Color.BLACK} margin={{ left: 'xsmall' }}>
          {getRiskDisplayText(risk, getString)}
        </Text>
      )}
    </Container>
  )
}
