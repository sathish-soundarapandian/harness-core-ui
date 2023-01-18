/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, FontVariation } from '@harness/design-system'
import { Text } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'

interface EmptyStateCollapsedViewProps {
  description: StringKeys
}

const EmptyStateCollapsedView: React.FC<EmptyStateCollapsedViewProps> = ({ description }) => {
  const { getString } = useStrings()
  return (
    <Text margin={{ top: 'small' }} color={Color.GREY_600} font={{ variation: FontVariation.SMALL }}>
      {getString(description)}
    </Text>
  )
}

export default EmptyStateCollapsedView
