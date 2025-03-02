/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import type { CellProps, Column, Renderer } from 'react-table'
import ReactTimeago from 'react-timeago'
import { Layout, Text, Button, ButtonVariation, NoDataCard, TableV2 } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type {
  PageResourceGroupResponse,
  ResourceFilter,
  ResourceGroupV2Response,
  StaticResourceSelector
} from 'services/resourcegroups'
import routes from '@common/RouteDefinitions'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getSelectedScopeLabel } from '@rbac/pages/ResourceGroupDetails/utils'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import ResourceGroupColumnMenu from './ResourceGroupColumnMenu'
import css from './ResourceGroupList.module.scss'

interface ResourceGroupListViewProps {
  data?: PageResourceGroupResponse
  reload?: () => Promise<void>
  openResourceGroupModal: () => void
}

export const RenderColumnDetails: Renderer<CellProps<ResourceGroupV2Response>> = ({ row }) => {
  const data = row.original.resourceGroup
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <div style={{ backgroundColor: data.color }} className={cx(css.resourceGroupColor)}></div>
      <Layout.Vertical spacing="xsmall" padding={{ left: 'small', right: 'small' }} width={'100%'}>
        <Text color={Color.BLACK} lineClamp={1}>
          {data.name}
        </Text>
        <Text color={Color.GREY_600} lineClamp={1} font="small">
          {getString('idLabel', { id: data.identifier })}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export const RenderColumnLastUpdated: Renderer<CellProps<ResourceGroupV2Response>> = ({ row }) => {
  const { getString } = useStrings()
  const data = row?.original
  if (data.harnessManaged) {
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getString('rbac.resourceGroup.builtInResourceGroup')}
      </Text>
    )
  }
  return data?.lastModifiedAt ? (
    <Text color={Color.BLACK} lineClamp={1}>
      <ReactTimeago date={data?.lastModifiedAt} />
    </Text>
  ) : null
}

const RenderColumnSummary: Renderer<CellProps<ResourceGroupV2Response>> = ({ row, column }) => {
  const { getString } = useStrings()
  const { resourceGroup, harnessManaged } = row.original
  const scope = getScopeFromDTO(resourceGroup)
  const resourceFilter = resourceGroup.resourceFilter
  const resourceTypeName = (data: ResourceFilter): string => {
    if (data.includeAllResources) {
      return getString('common.all')
    } else {
      return defaultTo(
        data.resources
          ?.map(resource => {
            const resourceTemp = RbacFactory.getResourceTypeHandler(resource?.resourceType as ResourceType)
            let label = resourceTemp?.label
            if (label) {
              if (!resource.identifiers?.length) {
                return getString('common.all', {
                  name: getString(label)
                })
              }
              if ((resource as StaticResourceSelector).identifiers?.length === 1 && resourceTemp?.labelSingular) {
                label = resourceTemp?.labelSingular
              }
              return `${(resource as StaticResourceSelector).identifiers?.length || 0} ${getString(label)}`
            }
            return get(resource, 'resourceType')
          })
          .join(', '),
        ''
      )
    }
  }

  if (harnessManaged) {
    return <Text color={Color.BLACK}>{resourceGroup.name}</Text>
  }
  return resourceFilter ? (
    <Layout.Vertical padding={{ right: 'medium' }}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
        <Text color={Color.BLACK} font={{ variation: FontVariation.BODY2 }}>
          {getString('resources')}:
        </Text>
        <Text lineClamp={1}>{resourceTypeName(resourceFilter)}</Text>
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
        <Text font={{ variation: FontVariation.BODY2 }} color={Color.BLACK}>
          {getString('common.scope')}:
        </Text>
        <Text>{getSelectedScopeLabel(getString, scope, defaultTo(resourceGroup.includedScopes, []))}</Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  ) : (
    <Button
      variation={ButtonVariation.LINK}
      className={css.selectResource}
      onClick={e => {
        e.stopPropagation()
        ;(column as any).openResourceSelector(resourceGroup.identifier)
      }}
    >
      {getString('selectResource')}
    </Button>
  )
}
const ResourceGroupListView: React.FC<ResourceGroupListViewProps> = props => {
  const { data, reload, openResourceGroupModal } = props
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const listData: ResourceGroupV2Response[] = data?.content || []
  const { getString } = useStrings()
  const history = useHistory()

  const openResourceSelector = (resourceGroupIdentifier: string): void => {
    history.push(
      routes.toResourceGroupDetails({
        resourceGroupIdentifier: resourceGroupIdentifier || '',
        accountId,
        orgIdentifier,
        projectIdentifier,
        module
      })
    )
  }

  const columns: Column<ResourceGroupV2Response>[] = useMemo(
    () => [
      {
        Header: getString('common.resourceGroupLabel'),
        accessor: row => row?.resourceGroup?.name,
        id: 'name',
        width: '30%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('rbac.resourceGroup.summary'),
        accessor: row => row?.resourceGroup?.resourceFilter,
        id: 'summary',
        width: '50%',
        Cell: RenderColumnSummary,
        openResourceSelector
      },
      {
        Header: getString('common.lastModified'),
        accessor: row => row?.lastModifiedAt,
        id: 'lastUpdated',
        width: '16%',
        Cell: RenderColumnLastUpdated
      },
      {
        Header: '',
        accessor: row => row?.resourceGroup?.identifier,
        width: '4%',
        id: 'action',
        Cell: ResourceGroupColumnMenu,
        disableSortBy: true,
        reload: reload,
        openResourceGroupModal
      }
    ],
    [props.data]
  )
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const paginationProps = useDefaultPaginationProps({
    itemCount: data?.totalItems || 0,
    pageSize: data?.pageSize || (PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : 10),
    pageCount: data?.totalPages || -1,
    pageIndex: data?.pageIndex || 0
  })

  return listData.length ? (
    <TableV2<ResourceGroupV2Response>
      className={css.tablePadding}
      columns={columns}
      data={listData}
      onRowClick={rowDetails => {
        if (!rowDetails.harnessManaged) {
          openResourceSelector(get(rowDetails, 'resourceGroup.identifier', ''))
        }
      }}
      pagination={paginationProps}
    />
  ) : (
    <NoDataCard icon="resources-icon" message={getString('rbac.resourceGroup.noResourceGroup')}></NoDataCard>
  )
}

export default ResourceGroupListView
