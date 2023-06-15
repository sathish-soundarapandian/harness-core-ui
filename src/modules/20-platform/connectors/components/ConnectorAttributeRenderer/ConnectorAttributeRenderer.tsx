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
import type { ConnectorCatalogueItem } from 'services/cd-ng'

interface ConnectorTypeList {
  label: string
  identifier: string
}

const RenderAttribute: Renderer<CellProps<ConnectorTypeList>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Vertical padding={{ left: 'small' }}>
      <Text color={Color.BLACK}>{data.label}</Text>
    </Layout.Vertical>
  )
}

const ConnectorAttributeRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceType,
  onResourceSelectionChange,
  isAtrributeFilterEnabled
}) => {
  const { getString } = useStrings()
  const ConnectorCatalogueNames = new Map<ConnectorCatalogueItem['category'], string>()
  ConnectorCatalogueNames.set('CLOUD_PROVIDER', getString('cloudProviders'))
  ConnectorCatalogueNames.set('ARTIFACTORY', getString('artifactRepositories'))
  ConnectorCatalogueNames.set('CODE_REPO', getString('codeRepositories'))
  ConnectorCatalogueNames.set('TICKETING', getString('ticketingSystems'))
  ConnectorCatalogueNames.set('MONITORING', getString('monitoringAndLoggingSystems'))
  ConnectorCatalogueNames.set('SECRET_MANAGER', getString('secretManagers'))
  ConnectorCatalogueNames.set('CLOUD_COST', getString('cloudCostsText'))

  const connectorAttrData: ConnectorTypeList[] = identifiers
    .filter(el => el)
    .map(identifier => ({
      identifier,
      label: ConnectorCatalogueNames.get(identifier as ConnectorCatalogueItem['category']) as string
    }))
    .filter(({ label }) => label)

  return (
    <StaticResourceRenderer
      data={connectorAttrData}
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

export default ConnectorAttributeRenderer
