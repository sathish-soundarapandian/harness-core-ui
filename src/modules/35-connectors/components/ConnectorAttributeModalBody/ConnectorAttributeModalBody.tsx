/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import ResourceHandlerTable, {
  ResourceHandlerTableData
} from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import type { RbacAttributeModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'

interface ConnectorTypeList {
  label: string
  identifier: string
}

// eslint-disable-next-line react/function-component-definition
const RenderConnectorType: Renderer<CellProps<ConnectorTypeList>> = ({ row }) => {
  const rowdata = row.original

  return (
    <Layout.Vertical spacing="small">
      <Text color={Color.GREY_800} iconProps={{ size: 16 }}>
        {rowdata.label}
      </Text>
    </Layout.Vertical>
  )
}

function ConnectorAttributeModalBody({ onSelectChange, selectedData }: RbacAttributeModalProps): React.ReactElement {
  const { getString } = useStrings()
  const connectorTypeList: ConnectorTypeList[] = [
    {
      label: getString('cloudProviders'),
      identifier: 'CLOUD_PROVIDER'
    },
    {
      label: getString('secretManagers'),
      identifier: 'SECRET_MANAGER'
    },
    {
      label: getString('cloudCostsText'),
      identifier: 'CLOUD_COST'
    },
    {
      label: getString('artifactRepositories'),
      identifier: 'ARTIFACTORY'
    },
    {
      label: getString('codeRepositories'),
      identifier: 'CODE_REPO'
    },
    {
      label: getString('monitoringAndLoggingSystems'),
      identifier: 'MONITORING'
    },
    {
      label: getString('ticketingSystems'),
      identifier: 'TICKETING'
    }
  ]

  return (
    <Container>
      <ResourceHandlerTable
        data={connectorTypeList as ResourceHandlerTableData[]}
        selectedData={selectedData}
        columns={[
          {
            id: 'label',
            accessor: 'label' as any,
            Cell: RenderConnectorType,
            width: '95%',
            disableSortBy: true
          }
        ]}
        onSelectChange={onSelectChange}
        hideHeaders={true}
      />
    </Container>
  )
}

export default ConnectorAttributeModalBody
