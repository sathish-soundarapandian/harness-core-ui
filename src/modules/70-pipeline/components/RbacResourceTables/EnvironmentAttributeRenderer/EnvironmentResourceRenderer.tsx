/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'

interface EnvironmentIdentifier {
  identifier: string
}

type CellType = { row: { original: EnvironmentIdentifier } }

function RenderIdentifier({ row }: CellType): Renderer<CellProps<EnvironmentIdentifier>> {
  const data = row.original
  return (
    <Layout.Vertical padding={{ left: 'small' }}>
      <Text color={Color.BLACK}>{data.identifier}</Text>
    </Layout.Vertical>
  )
}

function EnvironmentResourceRenderer({
  identifiers,
  resourceType,
  onResourceSelectionChange,
  isAtrributeFilterEnabled
}: RbacResourceRendererProps): React.ReactElement {
  const identifierMap = identifiers.map(identifier => ({ identifier }))

  return (
    <StaticResourceRenderer
      data={identifierMap}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      isAtrributeFilterEnabled={isAtrributeFilterEnabled}
      columns={[
        {
          id: 'identifier',
          width: '95%',
          accessor: 'identifier',
          Cell: RenderIdentifier,
          disableSortBy: true
        }
      ]}
    />
  )
}

export default EnvironmentResourceRenderer
