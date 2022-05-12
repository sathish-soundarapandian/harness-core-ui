/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { defaultTo, get } from 'lodash-es'

import { TableV2, useToaster } from '@harness/uicore'
import { EnvironmentResponse, useDeleteEnvironmentV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import { EnvironmentMenu, EnvironmentName, EnvironmentTypes, LastUpdatedBy } from './EnvironmentsListColumns'

export default function EnvironmentsList({ response, refetch }: any) {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { showSuccess, showError } = useToaster()
  const history = useHistory()

  const { mutate: deleteItem } = useDeleteEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const handleEnvEdit = (id: string): void => {
    history.push(
      routes.toEnvironmentDetails({
        accountId,
        orgIdentifier,
        projectIdentifier,
        module,
        environmentIdentifier: defaultTo(id, ''),
        sectionId: 'CONFIGURATION'
      })
    )
  }

  const handleEnvDelete = async (id: string) => {
    try {
      await deleteItem(id, { headers: { 'content-type': 'application/json' } })
      showSuccess(`Successfully deleted environment ${id}`)
      refetch()
    } catch (e: any) {
      showError(get(e, 'data.message', e?.message), 0, 'cf.delete.env.error')
    }
  }

  type CustomColumn<T extends Record<string, any>> = Column<T>

  const envColumns: CustomColumn<EnvironmentResponse>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '50%',
        Cell: EnvironmentName
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        id: 'type',
        width: '15%',
        Cell: EnvironmentTypes
      },
      {
        Header: getString('lastUpdatedBy').toUpperCase(),
        id: 'lastUpdatedBy',
        width: '25%',
        Cell: ({ row }: any) => {
          return <LastUpdatedBy lastModifiedAt={/*istanbul ignore next*/ row?.original?.lastModifiedAt} />
        }
      },
      {
        id: 'modifiedBy',
        width: '10%',
        Cell: EnvironmentMenu,
        actions: {
          onEdit: handleEnvEdit,
          onDelete: handleEnvDelete
        }
      }
    ],
    [getString, handleEnvDelete]
  )
  return (
    <TableV2<EnvironmentResponse>
      columns={envColumns}
      data={(response?.content as EnvironmentResponse[]) || []}
      onRowClick={(row: EnvironmentResponse) => {
        history.push(
          routes.toEnvironmentDetails({
            accountId,
            orgIdentifier,
            projectIdentifier,
            module,
            environmentIdentifier: defaultTo(row.environment?.identifier, ''),
            sectionId: 'CONFIGURATION'
          })
        )
      }}
    />
  )
}
