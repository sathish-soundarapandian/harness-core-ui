import { Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React from 'react'

interface CustomMetricsSectionHeaderProps {
  sectionTitle: string
  sectionSubTitle?: string
}

export default function CustomMetricsSectionHeader(props: CustomMetricsSectionHeaderProps): JSX.Element {
  const { sectionTitle, sectionSubTitle } = props
  return (
    <Layout.Vertical margin={{ bottom: 'medium' }}>
      <Text font={{ variation: FontVariation.CARD_TITLE }}>{sectionTitle}</Text>
      <Text font={{ variation: FontVariation.BODY }}>{sectionSubTitle}</Text>
    </Layout.Vertical>
  )
}
