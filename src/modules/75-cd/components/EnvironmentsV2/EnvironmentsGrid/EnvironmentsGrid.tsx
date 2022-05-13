/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'

import { Container, Layout, useToaster } from '@harness/uicore'

import { EnvironmentResponse, useDeleteEnvironmentV2 } from 'services/cd-ng'

import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import { EnvironmentCard } from './EnvironmentsCard'

export default function EnvironmentsGrid({ response, refetch }: any) {
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
  return (
    <Container width={1160} style={{ margin: '0 auto' }}>
      <Layout.Masonry
        center
        gutter={25}
        items={response?.content || []}
        renderItem={(item: EnvironmentResponse) => (
          <EnvironmentCard environment={item} onEdit={handleEnvEdit} onDelete={handleEnvDelete} />
        )}
        keyOf={(item: EnvironmentResponse) => item.environment?.identifier}
      />
    </Container>
  )
}
