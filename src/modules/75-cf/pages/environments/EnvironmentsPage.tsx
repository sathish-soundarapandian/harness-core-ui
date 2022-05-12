/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { get } from 'lodash-es'
import { Position } from '@blueprintjs/core'
import { Container, Layout, Pagination, Text, TableV2 } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import {
  EnvironmentResponseDTO,
  GetEnvironmentListForProjectQueryParams,
  useDeleteEnvironmentV2,
  useGetEnvironmentListForProject
} from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { useConfirmAction } from '@common/hooks/useConfirmAction'
import { useEnvStrings } from '@cf/hooks/environment'
import { String } from 'framework/strings'
import ListingPageTemplate from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import EnvironmentDialog from '@cf/components/CreateEnvironmentDialog/EnvironmentDialog'
import routes from '@common/RouteDefinitions'
import { NoEnvironment } from '@cf/components/NoEnvironment/NoEnvironment'
import { withTableData } from '@cf/utils/table-utils'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './EnvironmentsPage.module.scss'

type EnvData = { environment: EnvironmentResponseDTO }
const withEnvironment = withTableData<EnvironmentResponseDTO, EnvData>(({ row }) => ({ environment: row.original }))
const withActions = withTableData<
  EnvironmentResponseDTO,
  EnvData & { actions: { [P in 'onEdit' | 'onDelete']?: (id: string) => void } }
>(({ row, column }) => ({
  environment: row.original,
  actions: (column as any).actions as { [P in 'onEdit' | 'onDelete']?: (id: string) => void }
}))

export const TypeCell = withEnvironment(({ environment }) => {
  const { getString } = useEnvStrings()
  return <Text>{getString(environment.type === EnvironmentType.PRODUCTION ? 'production' : 'nonProduction')}</Text>
})

export const NameCell = withEnvironment(({ environment }) => {
  const { getString } = useEnvStrings()
  const tags = Object.entries(environment.tags ?? {}).reduce(
    (acc: Array<{ name: string; value: string }>, [key, value]: [string, string]) => {
      return [...acc, { name: key, value: value }]
    },
    [] as Array<{ name: string; value: string }>
  )
  return (
    <Layout.Horizontal
      flex={{ distribution: 'space-between', align: 'center-center' }}
      padding={{ left: 'small', right: 'small' }}
      style={{ maxWidth: 'calc(100% - var(--spacing-medium))' }}
    >
      <Layout.Vertical spacing="xsmall" style={{ maxWidth: 'calc(100% - 100px)' }}>
        <Text style={{ color: '#22222A', fontWeight: 500 }}>{environment.name}</Text>

        {environment.description && (
          <Container>
            <Text style={{ color: '#6B6D85', fontSize: '12px', lineHeight: '18px' }}>{environment.description}</Text>
          </Container>
        )}

        <Container padding={{ top: 'xsmall' }} margin={{ bottom: 'xsmall' }}>
          <IdentifierText identifier={environment.identifier} inline style={{ padding: 'var(--spacing-xsmall)' }} />
        </Container>
      </Layout.Vertical>
      <Layout.Horizontal>
        <Text
          width={100}
          flex
          icon="main-tags"
          style={{ justifyContent: 'center' }}
          tooltip={
            tags.length ? (
              <>
                <Text>{getString('tagsLabel').toUpperCase()}</Text>
                {tags.map((elem, i) => (
                  <Text key={`${elem.value}-${i}`}>{elem.name}</Text>
                ))}
              </>
            ) : undefined
          }
          tooltipProps={{
            portalClassName: css.tagsPopover,
            position: Position.RIGHT
          }}
        >
          {tags.length}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
})

export const ModifiedByCell = withActions(({ environment, actions }) => {
  const { getString } = useEnvStrings()
  const identifier = environment.identifier as string
  const deleteEnvironment = useConfirmAction({
    title: getString('cf.environments.delete.title'),
    message: <String useRichText stringID="cf.environments.delete.message" vars={{ name: environment.name }} />,
    action: () => {
      actions.onDelete?.(identifier)
    },
    intent: Intent.DANGER,
    confirmText: getString('delete')
  })

  return (
    <Layout.Horizontal style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* TODO: Add user info when BE is ready */}
      <Container
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
        }}
      >
        <RbacOptionsMenuButton
          items={[
            {
              icon: 'edit',
              text: getString('edit'),
              onClick: () => actions.onEdit?.(identifier),
              permission: {
                resource: { resourceType: ResourceType.ENVIRONMENT },
                permission: PermissionIdentifier.EDIT_ENVIRONMENT
              }
            },
            {
              icon: 'trash',
              text: getString('delete'),
              onClick: deleteEnvironment,
              permission: {
                resource: { resourceType: ResourceType.ENVIRONMENT },
                permission: PermissionIdentifier.DELETE_ENVIRONMENT
              }
            }
          ]}
        />
      </Container>
    </Layout.Horizontal>
  )
})

type CustomColumn<T extends Record<string, any>> = Column<T>

const EnvironmentsPage: React.FC = () => {
  const { getString } = useEnvStrings()
  const { showError, showSuccess } = useToaster()
  const history = useHistory()
  const [page, setPage] = useState(0)
  const { accountId: accountIdentifier, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const queryParams = useMemo<GetEnvironmentListForProjectQueryParams>(() => {
    return {
      accountId: accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      size: CF_DEFAULT_PAGE_SIZE,
      page
    }
  }, [accountIdentifier, orgIdentifier, projectIdentifier, page])
  const {
    data: envData,
    loading,
    error,
    refetch
  } = useGetEnvironmentListForProject({
    queryParams
  })
  const { mutate: deleteEnvironment } = useDeleteEnvironmentV2({
    queryParams: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier
    }
  })
  const environments = envData?.data?.content
  const hasEnvs = Boolean(!loading && envData?.data?.content?.length)
  const emptyEnvs = Boolean(!loading && envData?.data?.content?.length === 0)

  const handleEdit = (id: string) => {
    history.push(
      routes.toCFEnvironmentDetails({
        environmentIdentifier: id,
        projectIdentifier,
        orgIdentifier,
        accountId: accountIdentifier
      })
    )
  }

  const handleDeleteEnv = async (id: string) => {
    try {
      await deleteEnvironment(id, { headers: { 'content-type': 'application/json' } })
      showSuccess(`Successfully deleted environment ${id}`)
      refetch()
    } catch (e) {
      showError(get(e, 'data.message', e?.message), 0, 'cf.delete.env.error')
    }
  }

  const columns: CustomColumn<EnvironmentResponseDTO>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '75%',
        accessor: 'name',
        Cell: NameCell
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        id: 'type',
        accessor: 'type',
        width: '15%',
        Cell: TypeCell
      },
      {
        id: 'modifiedBy',
        width: '10%',
        Cell: ModifiedByCell,
        actions: {
          onEdit: handleEdit,
          onDelete: handleDeleteEnv
        }
      }
    ],
    [getString, handleDeleteEnv]
  )

  return (
    <ListingPageTemplate
      title={getString('environments')}
      titleTooltipId="ff_env_heading"
      toolbar={
        hasEnvs && (
          <Layout.Horizontal>
            <EnvironmentDialog
              disabled={loading}
              environments={environments}
              onCreate={response => {
                setTimeout(() => {
                  history.push(
                    routes.toCFEnvironmentDetails({
                      environmentIdentifier: response?.data?.identifier as string,
                      projectIdentifier,
                      orgIdentifier,
                      accountId: accountIdentifier
                    })
                  )
                }, 1000)
              }}
            />
          </Layout.Horizontal>
        )
      }
      pagination={
        <Pagination
          itemCount={envData?.data?.totalItems || 0}
          pageSize={envData?.data?.pageSize || 0}
          pageCount={envData?.data?.totalPages || 0}
          pageIndex={page}
          gotoPage={index => {
            setPage(index)
            refetch({ queryParams: { ...queryParams, page: index } })
          }}
        />
      }
      error={error}
      retryOnError={refetch}
      loading={loading}
    >
      {hasEnvs && (
        <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
          <TableV2<EnvironmentResponseDTO>
            columns={columns}
            data={(environments as EnvironmentResponseDTO[]) || []}
            onRowClick={({ identifier }) => handleEdit(identifier as string)}
          />
        </Container>
      )}
      {emptyEnvs && (
        <Container flex={{ align: 'center-center' }} height="100%">
          <NoEnvironment
            onCreated={response =>
              setTimeout(() => {
                history.push(
                  routes.toCFEnvironmentDetails({
                    environmentIdentifier: response?.data?.identifier as string,
                    projectIdentifier,
                    orgIdentifier,
                    accountId: accountIdentifier
                  })
                )
              }, 1000)
            }
          />
        </Container>
      )}
    </ListingPageTemplate>
  )
}

export default EnvironmentsPage
