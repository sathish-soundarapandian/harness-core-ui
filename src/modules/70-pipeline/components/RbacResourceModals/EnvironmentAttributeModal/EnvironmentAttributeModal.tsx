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

interface EnvironmentType {
  label?: string
  identifier: string
}

type CellType = { row: { original: EnvironmentType } }

function RenderEnvType({ row }: CellType): Renderer<CellProps<EnvironmentType>> {
  const rowdata = row.original

  return (
    <Layout.Vertical spacing="small">
      <Text color={Color.GREY_800} iconProps={{ size: 16 }}>
        {rowdata.label}
      </Text>
    </Layout.Vertical>
  )
}

function EnvironmentAttributeModal({ onSelectChange, selectedData }: RbacAttributeModalProps): React.ReactElement {
  const { getString } = useStrings()
  const environmentTypeList: EnvironmentType[] = [
    {
      label: getString('production'),
      identifier: 'Production'
    },
    {
      label: getString('nonProduction'),
      identifier: 'PreProduction'
    }
  ]

  return (
    <Container>
      <ResourceHandlerTable
        data={environmentTypeList as ResourceHandlerTableData[]}
        selectedData={selectedData}
        columns={[
          {
            id: 'label',
            accessor: 'label' as any,
            Cell: RenderEnvType,
            width: '60%',
            disableSortBy: true
          }
        ]}
        onSelectChange={onSelectChange}
        hideHeaders={true}
      />
    </Container>
  )
}

export default EnvironmentAttributeModal
