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

interface ConnectorIdentifierList {
  identifier: string
}

const RenderIdentifier: Renderer<CellProps<ConnectorIdentifierList>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical padding={{ left: 'small' }}>
      <Text color={Color.BLACK}>{data.identifier}</Text>
    </Layout.Vertical>
  )
}

const ConnectorResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceType,
  onResourceSelectionChange
}) => {
  const identifierMap = identifiers.map(identifier => ({ identifier }))
  return (
    <StaticResourceRenderer
      data={identifierMap}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
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

export default ConnectorResourceRenderer
