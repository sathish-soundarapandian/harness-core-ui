import React from 'react'
import { Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'

interface JiraViewDetailsDisplayProps {
  label: string
  value?: string
  testId: string
}

export function JiraViewDetailsDisplay({ label, value, testId }: JiraViewDetailsDisplayProps): JSX.Element {
  return (
    <>
      <Text font={{ variation: FontVariation.BODY2 }}>{label}</Text>
      <Text data-testid={testId} font={{ variation: FontVariation.BODY }}>
        {value}
      </Text>
    </>
  )
}
