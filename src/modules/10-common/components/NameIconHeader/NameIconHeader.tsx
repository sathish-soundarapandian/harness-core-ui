/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, IconProps, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

interface NameIconHeaderProps {
  iconProps: IconProps
  name: string
  className?: string
}

const NameIconHeader = ({ iconProps, name, className = '' }: NameIconHeaderProps): React.ReactElement => {
  return (
    <Layout.Horizontal className={className}>
      {iconProps && <Icon size={24} padding={{ right: 'small' }} {...iconProps} />}
      <Text color={Color.BLACK} font={{ variation: FontVariation.H4 }}>
        {name}
      </Text>
    </Layout.Horizontal>
  )
}

export default NameIconHeader
