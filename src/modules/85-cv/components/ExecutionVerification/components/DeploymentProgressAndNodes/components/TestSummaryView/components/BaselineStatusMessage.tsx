import React from 'react'
import { Card, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { VerificationOverview } from 'services/cv'
import { getStatusMessage } from './BaselineStatusMessage.utils'
import css from '../TestsSummaryView.module.scss'

interface BaselineStatusMessageProps {
  data: VerificationOverview | null
}

export default function BaselineStatusMessage(props: BaselineStatusMessageProps): JSX.Element | null {
  const { data } = props

  const { getString } = useStrings()

  const message = getStatusMessage(data, getString)

  if (!data || !message) {
    return null
  }

  return (
    <Card className={css.baselineStatusMessage}>
      <Text data-testid="baselineStatusMessage" font={{ variation: FontVariation.BODY }}>
        {message}
      </Text>
    </Card>
  )
}
