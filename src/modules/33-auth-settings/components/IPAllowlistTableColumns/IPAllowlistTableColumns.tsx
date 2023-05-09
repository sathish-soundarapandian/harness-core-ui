/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Renderer, CellProps } from 'react-table'

import type { IpAllowlistConfigResponse } from '@harnessio/react-ng-manager-client'
import { Text, Layout } from '@harness/uicore'

export const RenderColumnName: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ value }) => {
  return (
    <Layout.Horizontal padding={{ right: 'xlarge' }}>
      <Text lineClamp={1}>{value}</Text>
    </Layout.Horizontal>
  )
}

export const RenderColumnIPAddress: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ value }) => {
  return (
    <Layout.Horizontal padding={{ right: 'xlarge' }}>
      <Text lineClamp={1}>{value}</Text>
    </Layout.Horizontal>
  )
}
