/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, FontVariation, Layout, Table, Text } from '@harness/uicore'
import type { Column } from 'react-table'
import { get, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { SourceFilterItem, SourceFilters } from 'services/lw'
import { HandlerKind } from '@ce/constants'
import css from './RuleDetailsBody.module.scss'

interface CustomTabContainerProps {
  data: SourceFilters
}

const inclusionLabel = 'inclusion'

const CustomTabContainer: React.FC<CustomTabContainerProps> = ({ data }) => {
  const { getString } = useStrings()
  const filters = get(data, 'filters', [])
  const paths = filters.filter(item => item.kind === HandlerKind.path)
  const ips = filters.filter(item => item.kind === HandlerKind.ip)
  const headers = filters.filter(item => item.kind === HandlerKind.header)
  const columns: Column<any>[] = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('name'),
        width: '50%',
        Cell: ({ row }) => <Text>{row.original.name}</Text>
      },
      {
        accessor: 'value',
        Header: getString('valueLabel'),
        width: '50%',
        Cell: ({ row }) => {
          return <Text>{row.original.value}</Text>
        }
      }
    ],
    [data]
  )
  return (
    <Layout.Vertical spacing={'medium'} className={css.tabRowContainer}>
      {!isEmpty(paths) && (
        <Container>
          <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
            {data.type === inclusionLabel
              ? getString('ce.co.ruleDetails.customTab.includedPathHeader')
              : getString('ce.co.ruleDetails.customTab.excludedPathHeader')}
          </Text>
          {(paths as SourceFilterItem[]).map((item, i) => {
            return (
              <Layout.Vertical spacing={'small'} key={`path-cont-${i}`}>
                {get(item, 'path', []).map((val: string) => (
                  <Text key={val}>{val}</Text>
                ))}
              </Layout.Vertical>
            )
          })}
        </Container>
      )}
      {!isEmpty(headers) && (
        /* istanbul ignore next */ <Container>
          <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
            {data.type === inclusionLabel
              ? getString('ce.co.ruleDetails.customTab.includedHeaders')
              : getString('ce.co.ruleDetails.customTab.excludedHeaders')}
          </Text>
          <Table
            data={headers as SourceFilterItem[]}
            bpTableProps={{ bordered: true, condensed: true, striped: false }}
            columns={columns}
          />
        </Container>
      )}
      {!isEmpty(ips) && (
        <Container>
          <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
            {data.type === inclusionLabel
              ? getString('ce.co.ruleDetails.customTab.includedIp')
              : getString('ce.co.ruleDetails.customTab.excludedIp')}
          </Text>
          {(ips as SourceFilterItem[]).map((item, i) => {
            return (
              <Layout.Vertical spacing={'small'} key={`ip-cont-${i}`}>
                {get(item, 'ipaddresses', []).map((val: string) => (
                  <Text key={val}>{val}</Text>
                ))}
              </Layout.Vertical>
            )
          })}
        </Container>
      )}
    </Layout.Vertical>
  )
}

export default CustomTabContainer
