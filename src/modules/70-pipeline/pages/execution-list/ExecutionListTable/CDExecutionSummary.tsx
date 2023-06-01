/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon, Layout } from '@harness/uicore'

import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import css from './ExecutionListTable.module.scss'

export interface CDExecutionSummaryProps {
  stageInfo: Record<string, any>
}

export function CDExecutionSummary(props: CDExecutionSummaryProps): React.ReactElement | null {
  const { stageInfo } = props
  const serviceDisplayName = stageInfo.serviceInfo?.displayName
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const gitOpsEnvironments = stageInfo.gitopsExecutionSummary?.environments || []
  const environment = gitOpsEnvironments.length
    ? null
    : stageInfo.infraExecutionSummary?.name || stageInfo.infraExecutionSummary?.identifier
  const infra =
    stageInfo.infraExecutionSummary?.infrastructureName || stageInfo.infraExecutionSummary?.infrastructureIdentifier
  const { tag } = stageInfo.serviceInfo?.artifacts?.primary || {}

  const serviceScope = getScopeFromValue(stageInfo.serviceInfo?.identifier)
  const infrastructureScope = getScopeFromValue(stageInfo.infraExecutionSummary?.identifier)

  return serviceDisplayName || environment ? (
    <Layout.Horizontal spacing="medium" className={css.cdExecutionSummary}>
      {serviceDisplayName ? (
        <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
          <Icon name="services" size={14} />
          <Link
            to={routes.toServiceStudio({
              module: 'cd',
              accountId,
              ...(serviceScope != Scope.ACCOUNT && { orgIdentifier: orgIdentifier }),
              ...(serviceScope === Scope.PROJECT && { projectIdentifier: projectIdentifier }),
              serviceId: getIdentifierFromScopedRef(stageInfo.serviceInfo?.identifier || ''),
              accountRoutePlacement: 'settings'
            })}
            target="_blank"
            rel="noreferrer noopener"
          >
            <span>{serviceDisplayName}</span>
            {tag ? <span>&nbsp;({tag})</span> : null}
          </Link>
        </Layout.Horizontal>
      ) : null}

      {environment ? (
        <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }} className={css.environment}>
          <Icon name="environments" size={12} />
          <Link
            to={routes.toEnvironmentDetails({
              module: 'cd',
              accountId,
              ...(infrastructureScope != Scope.ACCOUNT && { orgIdentifier: orgIdentifier }),
              ...(infrastructureScope === Scope.PROJECT && { projectIdentifier: projectIdentifier }),
              environmentIdentifier: getIdentifierFromScopedRef(stageInfo.infraExecutionSummary?.identifier || ''),
              sectionId: 'INFRASTRUCTURE',
              accountRoutePlacement: 'settings'
            })}
            target="_blank"
            rel="noreferrer noopener"
          >
            <span>{environment}</span>
            {infra ? <span>&nbsp;({infra})</span> : null}
          </Link>
        </Layout.Horizontal>
      ) : null}
    </Layout.Horizontal>
  ) : null
}
