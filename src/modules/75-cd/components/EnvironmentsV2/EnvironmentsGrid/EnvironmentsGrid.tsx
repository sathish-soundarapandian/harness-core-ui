/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import { Container, Layout, useToaster } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { EnvironmentResponse, useDeleteEnvironmentV2 } from 'services/cd-ng'

import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import { EnvironmentCard } from './EnvironmentCard'
import { EnvironmentDetailsTab } from '../utils'

export default function EnvironmentsGrid({ response, refetch }: any) {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const history = useHistory()
  const { CDC_ENVIRONMENT_DASHBOARD_NG } = useFeatureFlags()

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

  const handleEnvDelete = async (id: string) => {
    try {
      await deleteItem(id, { headers: { 'content-type': 'application/json' } })
      showSuccess(getString('cd.environment.deleted'))
      refetch()
    } catch (e: any) {
      showError(getRBACErrorMessage(e))
    }
  }

  const handleOnClick = (id: string): void => {
    history.push(
      routes.toEnvironmentDetails({
        accountId,
        orgIdentifier,
        projectIdentifier,
        module,
        environmentIdentifier: defaultTo(id, ''),
        sectionId: CDC_ENVIRONMENT_DASHBOARD_NG ? EnvironmentDetailsTab.SUMMARY : EnvironmentDetailsTab.CONFIGURATION
      })
    )
  }

  return (
    <Container width={1160} style={{ margin: '0 auto' }}>
      <Layout.Masonry
        center
        gutter={25}
        items={defaultTo(/* istanbul ignore next */ response?.content, [])}
        renderItem={(item: EnvironmentResponse) => (
          <EnvironmentCard response={item} onEdit={handleEnvEdit} onClick={handleOnClick} onDelete={handleEnvDelete} />
        )}
        keyOf={(item: EnvironmentResponse) => item.environment?.identifier}
      />
    </Container>
  )
}
