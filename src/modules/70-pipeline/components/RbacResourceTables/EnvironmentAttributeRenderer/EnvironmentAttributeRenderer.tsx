/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { CellProps, Renderer } from 'react-table'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import { useStrings } from 'framework/strings'

interface EnvironmentType {
  label?: string
  identifier: string
}

type CellType = { row: { original: EnvironmentType } }

function RenderAttribute({ row }: CellType): Renderer<CellProps<EnvironmentType>> {
  const data = row.original
  return (
    <Layout.Vertical padding={{ left: 'small' }}>
      <Text color={Color.BLACK}>{data.label}</Text>
    </Layout.Vertical>
  )
}

function EnvironmentAttributeRenderer({
  identifiers,
  resourceType,
  onResourceSelectionChange,
  isAtrributeFilterEnabled
}: RbacResourceRendererProps): React.ReactElement {
  const { getString } = useStrings()
  const EnvironmentNames = new Map<string, string>()
  EnvironmentNames.set('Production', getString('production'))
  EnvironmentNames.set('PreProduction', getString('pipeline.preProduction'))

  const environmentAttrData: EnvironmentType[] = identifiers
    .filter(el => el)
    .map(identifier => ({
      identifier,
      label: EnvironmentNames.get(identifier)
    }))
    .filter(({ label }) => label)

  return (
    <StaticResourceRenderer
      data={environmentAttrData}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      isAtrributeFilterEnabled={isAtrributeFilterEnabled}
      columns={[
        {
          Header: '',
          id: 'label',
          width: '95%',
          accessor: 'label' as any,
          Cell: RenderAttribute,
          disableSortBy: true
        }
      ]}
    />
  )
}

export default EnvironmentAttributeRenderer
