/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Column, CellProps, Renderer } from 'react-table'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { Icon, Text, TableV2 } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetInheritingChildScopeList, ScopeName } from 'services/cd-ng'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

interface Scope {
  accountIdentifier: string
  orgName: string
  orgIdentifier: string
  projectName?: string | null
  projectIdentifier?: string | null
}

const RenderScopeType: Renderer<CellProps<Scope>> = ({ row }) => {
  const { projectIdentifier } = row.original
  const { getString } = useStrings()
  // TODO: Add regular `nav-organization` to HarnessIcons
  const icon = projectIdentifier ? 'nav-project' : 'nav-organization-hover'

  return (
    <Text icon={icon} iconProps={{ padding: { right: 'small' } }}>
      {getString(projectIdentifier ? 'projectLabel' : 'orgLabel')}
    </Text>
  )
}

const RenderScopeDescription: Renderer<CellProps<Scope>> = ({ row }) => {
  const { orgName, projectName } = row.original
  const { getString } = useStrings()

  if (!projectName) {
    return <Text>{orgName}</Text>
  }

  return (
    <>
      <Text>{projectName}</Text>
      <Text font={{ size: 'small' }} padding={{ top: 'xsmall' }} color={Color.GREY_400}>
        {getString('rbac.inheritedScope.projectOrg', { orgName })}
      </Text>
    </>
  )
}

const ScopeList: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, userGroupIdentifier } =
    useParams<PipelineType<ProjectPathProps & { userGroupIdentifier: string }>>()
  const { data, loading, error } = useGetInheritingChildScopeList({
    identifier: userGroupIdentifier,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const scopeListResponse: ScopeName[] | undefined = data?.data

  const columns: Column<ScopeName>[] = [
    {
      width: '25%',
      accessor: 'orgName',
      Cell: RenderScopeType
    },
    {
      width: '75%',
      accessor: 'projectName',
      Cell: RenderScopeDescription
    }
  ]

  if (loading)
    return (
      <Icon
        name="steps-spinner"
        size={32}
        color={Color.GREY_600}
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        padding="large"
      />
    )

  if (error) return <Text color={Color.RED_400}>{getString('rbac.inheritedScope.errorMessage')}</Text>

  return scopeListResponse && scopeListResponse.length ? (
    <TableV2<ScopeName> columns={columns} data={scopeListResponse} hideHeaders={true} />
  ) : (
    <Text>{getString('rbac.inheritedScope.noData')}</Text>
  )
}

export default ScopeList
