import { Card, Color, Container, FontVariation, Heading, Layout, Text } from '@harness/uicore'
import React from 'react'

export interface CustomMetricDetailsProps {
  headingText: string
  subHeading?: string
  children: React.ReactNode
}

export default function CustomMetricDetails(props: CustomMetricDetailsProps): JSX.Element {
  const { headingText, subHeading, children } = props
  return (
    <Card>
      <Layout.Vertical margin={{ bottom: 'medium' }}>
        <Heading level={2} color={Color.BLACK}>
          {headingText}
        </Heading>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
          {subHeading}
        </Text>
      </Layout.Vertical>
      <Container>{children}</Container>
    </Card>
  )
}
