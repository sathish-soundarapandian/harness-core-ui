import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Text } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'

interface EmptyStateCollapsedView {
  description: StringKeys
}

const EmptyStateCollapsedView: React.FC<EmptyStateCollapsedView> = ({ description }) => {
  const { getString } = useStrings()
  return (
    <Text margin={{ top: 'medium' }} color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
      {getString(description)}
    </Text>
  )
}

export default EmptyStateCollapsedView
