/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { Column } from 'react-table'

import { useStrings } from 'framework/strings'
import { useMutateAsGet } from '@common/hooks'
import { PageSpinner } from '@common/components'
import { Rule, useGetPolicies } from 'services/ce'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { RuleNameCell } from './GovernanceRulesResourceCells'

import css from '../Perspective/PerspectiveResourceModalBody.module.scss'

type ParsedColumnContent = Rule & { identifier: string }

const GovernanceRulesResourceModalBody: React.FC<RbacResourceModalProps> = ({
  searchTerm,
  resourceScope,
  onSelectChange,
  selectedData
}) => {
  const { getString } = useStrings()
  const { accountIdentifier } = resourceScope

  const [page, setPage] = useState(0)

  const { data: rulesResponse, loading } = useMutateAsGet(useGetPolicies, {
    queryParams: {
      accountIdentifier
    },
    body: {
      query: {
        limit: 10,
        offset: page * 10,
        search: searchTerm,
        orderBy: [{ field: 'RULE_NAME', order: 'ASCENDING' }]
      }
    }
  })

  const rules = rulesResponse?.data?.rules
  const totalItems = rulesResponse?.data?.totalItems

  const rulesData = rules?.map(rule => ({
    identifier: rule.uuid,
    ...rule
  }))

  const columns: Column<ParsedColumnContent>[] = useMemo(
    () => [
      {
        Header: getString('name'),
        accessor: 'name',
        id: 'name',
        width: '75%',
        Cell: RuleNameCell
      },
      {
        Header: getString('pipelineSteps.targetLabel'),
        accessor: 'cloudProvider',
        id: 'cloudProvider',
        width: '25%',
        Cell: () => {
          return <Icon size={20} name="service-aws" />
        }
      }
    ],
    [getString]
  )

  if (loading) return <PageSpinner />

  return rulesData?.length ? (
    <Container>
      <ResourceHandlerTable
        data={rulesData as ParsedColumnContent[]}
        selectedData={selectedData}
        columns={columns}
        onSelectChange={onSelectChange}
        pagination={{
          itemCount: totalItems || 0,
          pageCount: totalItems ? Math.ceil(totalItems / 10) : 1,
          pageSize: 10,
          pageIndex: page,
          gotoPage: setPage
        }}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small" className={css.noDataContainer}>
      <Icon name="resources-icon" size={20} />
      <Text font={{ variation: FontVariation.BODY1 }} color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default GovernanceRulesResourceModalBody
