/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import type { Renderer, CellProps } from 'react-table'

import type { IpAllowlistConfigResponse } from '@harnessio/react-ng-manager-client'
import { Text, Layout } from '@harness/uicore'

import { useStrings } from 'framework/strings'

export const RenderColumnName: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ row }) => {
  const { getString } = useStrings()
  const ipAllowlistConfig = row.original.ip_allowlist_config
  return (
    <Layout.Vertical padding={{ right: 'xlarge' }}>
      <Text lineClamp={1} font={{ weight: 'bold' }}>
        {ipAllowlistConfig.name}
      </Text>
      <Text lineClamp={1} font={'small'}>
        {`${getString('common.ID')}: ${ipAllowlistConfig.identifier}`}
      </Text>
    </Layout.Vertical>
  )
}

export const RenderColumnIPAddress: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ value }) => {
  return (
    <Layout.Horizontal padding={{ right: 'xlarge' }}>
      <Text lineClamp={1}>{value}</Text>
    </Layout.Horizontal>
  )
}

export const RenderColumnApplicableFor: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ row }) => {
  const { getString } = useStrings()
  const allowSourceType = defaultTo(row.original.ip_allowlist_config.allowed_source_type, [])
  const applicableFor = allowSourceType.length > 0 ? allowSourceType.join(', ') : getString('na')
  return (
    <Layout.Horizontal padding={{ right: 'small' }}>
      <Text>{applicableFor}</Text>
    </Layout.Horizontal>
  )
}
