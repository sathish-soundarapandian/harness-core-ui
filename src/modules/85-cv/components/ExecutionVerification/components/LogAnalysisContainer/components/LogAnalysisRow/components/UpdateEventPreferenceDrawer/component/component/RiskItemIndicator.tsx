import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import type { LogFeedback } from 'services/cv'
import { getRiskColor } from '../../UpdateEventPreferenceDrawer.utils'
import css from '../../UpdateEventPreferenceDrawer.module.scss'

interface RiskItemIndicatorProps {
  isSmall?: boolean
  risk?: LogFeedback['feedbackScore']
}

export default function RiskItemIndicator({ isSmall = false, risk }: RiskItemIndicatorProps): JSX.Element | null {
  if (isEmpty(risk)) {
    return null
  }

  return (
    <div
      className={cx(css.riskColorIndicator, {
        [css.riskColorIndicatorSmall]: isSmall
      })}
      style={{ background: getRiskColor(risk) }}
    />
  )
}
