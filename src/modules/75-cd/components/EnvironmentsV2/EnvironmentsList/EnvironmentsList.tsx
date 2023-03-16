/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { defaultTo, get } from 'lodash-es'

import { TableV2, useToaster } from '@harness/uicore'
import { EnvironmentResponse, EnvironmentResponseDTO, useDeleteEnvironmentV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'

import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { FeatureFlag } from '@common/featureFlags'
import { useEntityDeleteErrorHandlerDialog } from '@common/hooks/EntityDeleteErrorHandlerDialog/useEntityDeleteErrorHandlerDialog'
import {
  EnvironmentMenu,
  EnvironmentName,
  EnvironmentTypes,
  withEnvironment,
  LastUpdatedBy
} from './EnvironmentsListColumns'
import { EnvironmentDetailsTab } from '../utils'

export default function EnvironmentsList({ response, refetch }: any) {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const history = useHistory()
  const [environmentToDelete, setEnvironmentToDelete] = useState<EnvironmentResponseDTO>({})
  const isForceDeletedAllowed = useFeatureFlag(FeatureFlag.CDS_FORCE_DELETE_ENTITIES)

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
        sectionId: EnvironmentDetailsTab.CONFIGURATION
      })
    )
  }

  const handleEnvDelete = async (
    environment: Required<EnvironmentResponseDTO>,
    forceDelete?: boolean
  ): Promise<void> => {
    try {
      await deleteItem(environment.identifier, {
        headers: { 'content-type': 'application/json' },
        queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier, forceDelete }
      })
      showSuccess(getString('cd.environment.deleted'))
      refetch()
    } catch (e: any) {
      if (isForceDeletedAllowed && e?.data?.code === 'ENTITY_REFERENCE_EXCEPTION') {
        setEnvironmentToDelete(environment)
        openReferenceErrorDialog()
      } else {
        showError(getRBACErrorMessage(e))
      }
    }
  }

  const redirectToReferencedBy = (): void => {
    history.push(
      routes.toEnvironmentDetails({
        accountId,
        orgIdentifier,
        projectIdentifier,
        environmentIdentifier: environmentToDelete.identifier as string,
        module,
        sectionId: EnvironmentDetailsTab.REFERENCED_BY
      })
    )
  }

  const { openDialog: openReferenceErrorDialog } = useEntityDeleteErrorHandlerDialog({
    entity: {
      type: ResourceType.ENVIRONMENT,
      name: environmentToDelete.name as string
    },
    redirectToReferencedBy,
    forceDeleteCallback: isForceDeletedAllowed
      ? () => handleEnvDelete(environmentToDelete as Required<EnvironmentResponseDTO>, true)
      : undefined
  })

  type CustomColumn<T extends Record<string, any>> = Column<T>

  const envColumns: CustomColumn<EnvironmentResponse>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '50%',
        Cell: withEnvironment(EnvironmentName)
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        id: 'type',
        width: '15%',
        Cell: withEnvironment(EnvironmentTypes)
      },
      {
        Header: getString('lastUpdated').toUpperCase(),
        id: 'lastUpdatedBy',
        width: '25%',
        Cell: withEnvironment(LastUpdatedBy)
      },
      {
        id: 'modifiedBy',
        width: '10%',
        Cell: withEnvironment(EnvironmentMenu),
        actions: {
          onEdit: handleEnvEdit,
          onDelete: handleEnvDelete
        }
      }
    ],
    [getString]
  )
  return (
    <TableV2<EnvironmentResponse>
      columns={envColumns}
      data={response.content}
      onRowClick={(row: EnvironmentResponse) => {
        history.push(
          routes.toEnvironmentDetails({
            accountId,
            orgIdentifier,
            projectIdentifier,
            module,
            environmentIdentifier: get(row, 'environment.identifier', ''),
            sectionId: projectIdentifier ? EnvironmentDetailsTab.SUMMARY : EnvironmentDetailsTab.CONFIGURATION
          })
        )
      }}
    />
  )
}
