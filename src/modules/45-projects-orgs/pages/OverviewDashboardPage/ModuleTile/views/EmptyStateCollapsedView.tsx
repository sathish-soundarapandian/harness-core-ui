import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Text } from '@harness/uicore'

interface EmptyStateCollapsedView {
  description: string
}

const EmptyStateCollapsedView: React.FC<EmptyStateCollapsedView> = ({ description }) => {
  return (
    <Text margin={{ top: 'medium' }} color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
      {description}
    </Text>
  )
}

export default EmptyStateCollapsedView
