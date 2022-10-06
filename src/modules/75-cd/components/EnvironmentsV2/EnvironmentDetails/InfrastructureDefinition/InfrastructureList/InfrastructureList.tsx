/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { defaultTo } from 'lodash-es'

import { ButtonVariation, Container, Heading, Layout, TableV2, useToaster } from '@harness/uicore'

import { InfrastructureResponse, useDeleteInfrastructure } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { EnvironmentPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import { InfrastructureMenu, InfrastructureName, LastUpdatedBy, withInfrastructure } from './InfrastructureListColumns'

import EmptyInfrastructure from '../images/EmptyInfrastructure.svg'

export default function InfrastructureList({
  list,
  showModal,
  refetch,
  setSelectedInfrastructure
}: {
  list?: InfrastructureResponse[]
  showModal: () => void
  refetch: () => void
  setSelectedInfrastructure: (infrastructureYaml: string) => void
}): React.ReactElement {
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    ProjectPathProps & EnvironmentPathProps
  >()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const { mutate: deleteInfrastructure } = useDeleteInfrastructure({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      environmentIdentifier
    }
  })

  const onEdit = (yaml: string): void => {
    setSelectedInfrastructure(yaml)
  }

  const onDelete = async (identifier: string): Promise<void> => {
    try {
      await deleteInfrastructure(identifier, { headers: { 'content-type': 'application/json' } })
      showSuccess(getString('cd.infrastructure.deleted', { identifier }))
      refetch()
    } catch (error) {
      showError(getRBACErrorMessage(error))
    }
  }

  type CustomColumn<T extends Record<string, any>> = Column<T>
  const infrastructureColumns: CustomColumn<InfrastructureResponse>[] = useMemo(
    () => [
      {
        Header: getString('infrastructureText').toUpperCase(),
        id: 'name',
        width: '50%',
        Cell: withInfrastructure(InfrastructureName)
      },
      {
        Header: getString('lastUpdated').toUpperCase(),
        id: 'lastUpdatedBy',
        width: '30%',
        Cell: withInfrastructure(LastUpdatedBy)
      },
      {
        id: 'editOrDelete',
        width: '20%',
        Cell: withInfrastructure(InfrastructureMenu),
        actions: {
          onEdit,
          onDelete
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getString]
  )

  const hasInfrastructure = Boolean(list?.length)
  const emptyEnvironment = Boolean(list?.length === 0)

  return (
    <>
      {hasInfrastructure && (
        <Container padding={{ top: 'small' }} margin={{ top: 'medium' }} border={{ top: true }}>
          <TableV2<InfrastructureResponse>
            columns={infrastructureColumns}
            data={defaultTo(list, [])}
            sortable
            onRowClick={rowItem => onEdit(defaultTo(rowItem.infrastructure?.yaml, '{}'))}
          />
        </Container>
      )}
      {emptyEnvironment && (
        <Layout.Vertical flex={{ align: 'center-center' }} height={'70vh'}>
          <img src={EmptyInfrastructure} alt={getString('cd.infrastructure.noInfrastructureInEnvironment')} />
          <Heading level={2} padding={{ top: 'xxlarge' }} margin={{ bottom: 'large' }}>
            {getString('cd.infrastructure.noInfrastructureInEnvironment')}
          </Heading>
          <RbacButton
            text={getString('pipelineSteps.deploy.infrastructure.infraDefinition')}
            icon="plus"
            onClick={showModal}
            variation={ButtonVariation.PRIMARY}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT
              },
              permission: PermissionIdentifier.EDIT_ENVIRONMENT
            }}
          />
        </Layout.Vertical>
      )}
    </>
  )
}
