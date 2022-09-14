import { Card, Color, FontVariation, Heading, Text } from '@harness/uicore'
import React from 'react'

export interface CustomMetricDetailsProps {
  headingText: string
  subHeading?: string
}

export default function CustomMetricDetails(props: CustomMetricDetailsProps): JSX.Element {
  const { headingText, subHeading } = props
  return (
    <Card>
      <Heading level={2} color={Color.BLACK}>
        {headingText}
      </Heading>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
        {subHeading}
      </Text>
    </Card>
  )
}
