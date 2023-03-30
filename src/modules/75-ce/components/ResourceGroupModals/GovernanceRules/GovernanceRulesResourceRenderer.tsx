/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Icon, PageSpinner } from '@harness/uicore'
import type { Column } from 'react-table'

import { useMutateAsGet } from '@common/hooks'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import type { ResourceHandlerTableData } from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { Rule, useGetPolicies } from 'services/ce'

import { RuleNameCell } from './GovernanceRulesResourceCells'

type RuleWithIdentifier = Rule & ResourceHandlerTableData

const PerspectiveResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier } = resourceScope

  const { data: rulesResponse, loading } = useMutateAsGet(useGetPolicies, {
    queryParams: {
      accountIdentifier
    },
    body: {
      query: {}
    }
  })

  const rulesData: RuleWithIdentifier[] =
    rulesResponse?.data?.rules
      ?.map(rule => ({
        identifier: rule.uuid as string,
        ...rule
      }))
      ?.filter(item => identifiers.includes(item.identifier)) || []

  const columns: Column<RuleWithIdentifier>[] = useMemo(
    () => [
      {
        id: 'name',
        accessor: 'name',
        width: '70%',
        Cell: RuleNameCell
      },
      {
        accessor: 'cloudProvider',
        id: 'cloudProvider',
        width: '25%',
        Cell: () => {
          return <Icon size={20} name="service-aws" />
        }
      }
    ],
    []
  )

  if (loading) return <PageSpinner />

  return rulesData?.length ? (
    <StaticResourceRenderer<RuleWithIdentifier>
      data={rulesData}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={columns}
    />
  ) : null
}

export default PerspectiveResourceRenderer
