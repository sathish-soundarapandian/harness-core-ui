/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { ItemContainer, ItemContainerProps } from '../ItemContainer/ItemContainer'

export const NoDataFoundRow: React.FC<ItemContainerProps & { message: string }> = ({ message, ...props }) => (
  <ItemContainer {...props}>
    <Text background={Color.WHITE} padding="xsmall" style={{ textAlign: 'center' }} color={Color.GREY_400}>
      {message}
    </Text>
  </ItemContainer>
)
