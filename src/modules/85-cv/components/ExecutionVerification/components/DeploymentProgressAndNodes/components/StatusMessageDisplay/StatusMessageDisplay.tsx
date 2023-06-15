import React from 'react'
import { Card, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import css from './StatusMessageDisplay.module.scss'

interface StatusMessageDisplayProps {
  message?: string | null
  messageTestId?: string
}

export function StatusMessageDisplay(props: StatusMessageDisplayProps): JSX.Element | null {
  const { message, messageTestId } = props

  if (!message) {
    return null
  }

  return (
    <Card className={css.statusMessageDisplay}>
      <Text data-testid={messageTestId} font={{ variation: FontVariation.BODY }}>
        {message}
      </Text>
    </Card>
  )
}
