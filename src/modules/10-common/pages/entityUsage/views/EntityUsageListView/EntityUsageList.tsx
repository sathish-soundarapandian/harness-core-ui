/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useHistory } from 'react-router-dom'
import type { Column, Renderer, CellProps } from 'react-table'
import { Text, Layout, Icon, TableV2 } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import moment from 'moment'
import type {
  EntityDetail,
  EntityReference,
  EntitySetupUsageDTO,
  ResponsePageEntitySetupUsageDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import ResourceDetailFactory from '@common/factories/ResourceDetailFactory'
import { EntityType } from '@common/pages/entityUsage/EntityConstants'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { getScopeLabelfromScope } from '@common/components/EntityReference/EntityReference'
import type { StringKeys } from 'framework/strings'
import { getScopeFromDTO } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'

import routes from '@common/RouteDefinitions'
import { Scope } from '@common/interfaces/SecretsInterface'
import css from './EntityUsageList.module.scss'
interface EntityUsageListProps {
  entityData: ResponsePageEntitySetupUsageDTO | null
  gotoPage: (pageNumber: number) => void
  withNoSpaceAroundTable?: boolean
}

interface ReferredByEntity extends EntityDetail {
  entityRef?: EntityReference & { versionLabel?: string }
}
export interface EntitySetupUsageDTOColumnData extends EntitySetupUsageDTO {
  getString?: (key: StringKeys, vars?: Record<string, any>) => string
  enableURLLinkToScope?: boolean
  history?: any
}

const getReferredByEntityName = (referredByEntity?: ReferredByEntity) => {
  if (!referredByEntity) {
    return ''
  }

  if (referredByEntity.type === EntityType.Template && referredByEntity.entityRef?.versionLabel) {
    return `${referredByEntity.name} (${referredByEntity.entityRef.versionLabel})`
  }

  return referredByEntity.name
}
const getReferredByEntityScopeId = (scope: Scope, referredByEntity?: ReferredByEntity) => {
  switch (scope) {
    case Scope.PROJECT:
      return referredByEntity?.entityRef?.projectIdentifier
    case Scope.ORG:
      return referredByEntity?.entityRef?.orgIdentifier
    default:
      return ''
  }
}
const RenderColumnEntity: Renderer<CellProps<EntitySetupUsageDTOColumnData>> = ({ row, column }) => {
  const data = row.original
  const scopeURL = getEntityURL(data.referredByEntity)
  const checkReferredByEntityTypeHandler = ResourceDetailFactory.getReferredByEntityTypeHandler(
    data.referredByEntity.type
  )
  if (checkReferredByEntityTypeHandler)
    return checkReferredByEntityTypeHandler.getResourceDetailViewAndAction({ referredByEntity: data.referredByEntity })
  else
    return (
      <Layout.Vertical>
        <Text color={Color.BLACK} lineClamp={1} className={css.overflow}>
          {scopeURL ? (
            <>
              <a
                rel="noreferrer"
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  ;(column as any)?.history?.push(scopeURL)
                }}
              >
                {getReferredByEntityName(data.referredByEntity)}
              </a>
            </>
          ) : (
            <>{getReferredByEntityName(data.referredByEntity)}</>
          )}
        </Text>
        <Text color={Color.GREY_400} lineClamp={1} className={css.overflow}>
          {`${(column as any).getString('typeLabel')}: ${data.referredByEntity?.type}`}
        </Text>
      </Layout.Vertical>
    )
}
const RenderColumnDetail: Renderer<CellProps<EntitySetupUsageDTO>> = ({ row }) => {
  const data = row.original
  const chkReferredEntityDetailHandler = ResourceDetailFactory.getReferredEntityUsageDetailTypeHandler(
    data.detail?.type
  )
  if (chkReferredEntityDetailHandler)
    return chkReferredEntityDetailHandler.getResourceDetailViewAndAction({
      referredEntity: data.referredEntity,
      referredByEntity: data.referredByEntity,
      detail: data.detail
    })
  else if (
    data.referredByEntity?.type === (EntityType.Infrastructure as EntityDetail['type']) &&
    data.referredEntity?.type === EntityType.Connectors &&
    data.detail?.environmentName
  )
    return (
      <Text color={Color.GREY_400} lineClamp={1} className={css.overflow}>
        {data.detail.environmentName}
      </Text>
    )
  else return null
}

const RenderColumnActivity: Renderer<CellProps<EntitySetupUsageDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      {data.createdAt ? moment(data.createdAt).format('MMM DD, YYYY hh:mm a') : null}
    </Layout.Horizontal>
  )
}
const getEntityURL = (referredByEntity: EntityDetail) => {
  const accountId = referredByEntity.entityRef?.accountIdentifier || ''
  const orgIdentifier = referredByEntity.entityRef?.orgIdentifier || ''
  const projectIdentifier = referredByEntity.entityRef?.projectIdentifier || ''
  switch (referredByEntity.type) {
    case 'Connectors':
      return routes.toConnectorDetails({
        accountId,
        connectorId: referredByEntity.entityRef?.identifier || '',
        orgIdentifier,
        projectIdentifier
      })
    case 'Service':
      return `${routes.toServiceStudio({
        accountId,
        serviceId: referredByEntity.entityRef?.identifier || '',
        orgIdentifier,
        projectIdentifier
      })}?tab=configuration`
    case 'Template':
      return `${routes.toTemplates({
        accountId,
        orgIdentifier,
        projectIdentifier
      })}`
    case 'Pipelines':
      return `${routes.toPipelineStudio({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier: referredByEntity.entityRef?.identifier || ''
      })}`
    case 'Secrets':
      return `${routes.toSecretDetailsOverview({
        accountId,
        orgIdentifier,
        projectIdentifier,
        secretId: referredByEntity.entityRef?.identifier || ''
      })}`
    case 'EnvironmentGroup':
      return `${routes.toEnvironmentGroupDetails({
        accountId,
        orgIdentifier,
        projectIdentifier,
        environmentGroupIdentifier: referredByEntity.entityRef?.identifier || ''
      })}`
    case 'Infrastructure':
      return `${routes.toEnvironmentDetails({
        accountId,
        orgIdentifier,
        projectIdentifier,
        environmentIdentifier: (referredByEntity.entityRef as any)?.envIdentifier || ''
      })}?sectionId=INFRASTRUCTURE`

    default:
      return ''
  }
}
export const RenderScope: Renderer<CellProps<EntitySetupUsageDTOColumnData>> = ({ row, column }) => {
  const data = row.original
  const { accountIdentifier, orgIdentifier, projectIdentifier } = data.referredByEntity?.entityRef || {
    accountIdentifier: '',
    orgIdentifier: '',
    projectIdentifier: ''
  }
  const scopeURL = (column as any).enableURLLinkToScope ? getEntityURL(data.referredByEntity) : ''
  const scope = getScopeFromDTO({ accountIdentifier, orgIdentifier, projectIdentifier, identifier: '' })
  const scopeName = getScopeLabelfromScope(scope, (column as any).getString)

  const scopeId = getReferredByEntityScopeId(scope, data.referredByEntity)
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} lineClamp={1} className={css.overflow}>
        {scopeURL ? (
          <a
            rel="noreferrer"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              ;(column as any)?.history?.push(scopeURL)
            }}
          >
            {scopeId || scopeName}
          </a>
        ) : (
          <> {scopeId || scopeName}</>
        )}
      </Text>
      {scopeId && (
        <Text color={Color.GREY_400} lineClamp={1} className={css.overflow}>
          {`${(column as any).getString('typeLabel')}: ${scopeName}`}
        </Text>
      )}
    </Layout.Vertical>
  )
}
export const RenderGitDetails: Renderer<CellProps<EntitySetupUsageDTO>> = ({ row }) => {
  const data = row.original

  return data.referredByEntity.entityRef?.branch && data.referredByEntity.entityRef?.repoIdentifier ? (
    <Layout.Horizontal spacing="small">
      <Icon inline name="repository" color={Color.GREY_600}></Icon>
      <Text className={css.gitText} margin={{ right: 'medium' }}>
        {data.referredByEntity.entityRef?.repoIdentifier}
      </Text>

      <Icon inline name="git-new-branch" size={14} color={Color.GREY_600}></Icon>
      <Text className={css.gitText}>{data.referredByEntity.entityRef?.branch}</Text>
    </Layout.Horizontal>
  ) : null
}

const EntityUsageList: React.FC<EntityUsageListProps> = ({ entityData, gotoPage, withNoSpaceAroundTable = false }) => {
  const data: EntitySetupUsageDTO[] = entityData?.data?.content || []
  const { getString } = useStrings()

  const history = useHistory()

  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const columns: Column<EntitySetupUsageDTOColumnData>[] = useMemo(
    () => [
      {
        Header: getString('entity'),
        accessor: 'referredByEntity',
        width: isGitSyncEnabled ? '25%' : '30%',
        Cell: RenderColumnEntity,
        getString: getString,
        history: history
      },
      {
        Header: getString('common.gitSync.repoDetails').toUpperCase(),
        accessor: row => row.referredByEntity?.entityRef?.repoIdentifier,
        width: '30%',
        Cell: RenderGitDetails
      },
      {
        Header: getString('details'),
        accessor: 'detail',
        width: isGitSyncEnabled ? '20%' : '30%',
        Cell: RenderColumnDetail
      },
      {
        Header: getString('created'),
        accessor: 'createdAt',
        width: isGitSyncEnabled ? '15%' : '20%',
        Cell: RenderColumnActivity
      },
      {
        Header: getString('common.scopeLabel'),
        width: isGitSyncEnabled ? '10%' : '20%',
        Cell: RenderScope,
        getString: getString,
        enableURLLinkToScope: true,
        history: history
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, isGitSyncEnabled]
  )

  if (!isGitSyncEnabled) {
    columns.splice(1, 1)
  }

  return (
    <TableV2<EntitySetupUsageDTOColumnData>
      className={cx(css.table, withNoSpaceAroundTable ? css.tableWithNoSpace : css.tableWithSpace)}
      columns={columns}
      data={data}
      pagination={{
        itemCount: entityData?.data?.totalItems || 0,
        pageSize: entityData?.data?.pageSize || 10,
        pageCount: entityData?.data?.totalPages || 0,
        pageIndex: entityData?.data?.pageIndex || 0,
        gotoPage
      }}
    />
  )
}

export default EntityUsageList
