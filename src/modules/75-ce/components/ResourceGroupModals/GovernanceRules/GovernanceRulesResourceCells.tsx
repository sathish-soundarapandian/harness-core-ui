/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { CellProps } from 'react-table'

import type { Rule } from 'services/ce'

export const RuleNameCell: React.FC<CellProps<Rule>> = ({ row }) => {
  const { isOOTB, name } = row.original

  return (
    <Layout.Horizontal style={{ alignItems: 'center' }} spacing="small">
      <Icon
        background={isOOTB ? Color.PRIMARY_5 : Color.PRIMARY_2}
        padding="small"
        name={isOOTB ? 'harness-with-color' : 'custom-artifact'}
        color={isOOTB ? Color.WHITE : Color.PRIMARY_7}
        style={{ borderRadius: '50%' }}
      />
      <Text font={{ variation: FontVariation.BODY2 }}>{name}</Text>
    </Layout.Horizontal>
  )
}
