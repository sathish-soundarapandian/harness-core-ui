import React from 'react'
import { defaultTo } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'
import { Icon, Layout } from '@harness/uicore'

import routes from '@common/RouteDefinitions'
import type { GitOpsExecutionSummary } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import css from './ExecutionListTable.module.scss'

export interface CDExecutionSummaryProps {
  stageInfo: Record<string, any>
}

export function CDExecutionSummary(props: CDExecutionSummaryProps): React.ReactElement | null {
  const { stageInfo } = props
  const serviceDisplayName = stageInfo.serviceInfo?.displayName
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  // This will removed with the multi service env list view effort
  const gitOpsEnvironments = Array.isArray(stageInfo.gitopsExecutionSummary?.environments)
    ? (stageInfo.gitopsExecutionSummary as Required<GitOpsExecutionSummary>).environments.map(envForGitOps =>
        defaultTo(envForGitOps.name, '')
      )
    : []

  const environment = gitOpsEnvironments.length
    ? gitOpsEnvironments.join(', ')
    : stageInfo.infraExecutionSummary?.name || stageInfo.infraExecutionSummary?.identifier
  const infra =
    stageInfo.infraExecutionSummary?.infrastructureName || stageInfo.infraExecutionSummary?.infrastructureIdentifier
  const { tag } = stageInfo.serviceInfo?.artifacts?.primary || {}

  return serviceDisplayName && environment ? (
    <Layout.Horizontal spacing="medium" className={css.cdExecutionSummary}>
      <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }} className={css.service}>
        <Icon name="services" size={14} />
        <Link
          to={routes.toServiceStudio({
            module: 'cd',
            accountId,
            orgIdentifier,
            projectIdentifier,
            serviceId: stageInfo.serviceInfo?.identifier
          })}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span>{serviceDisplayName}</span>
          {tag ? <span>&nbsp;({tag})</span> : null}
        </Link>
      </Layout.Horizontal>

      <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
        <Icon name="environments" size={12} />
        <Link
          to={routes.toEnvironmentDetails({
            module: 'cd',
            accountId,
            orgIdentifier,
            projectIdentifier,
            environmentIdentifier: stageInfo.infraExecutionSummary?.identifier,
            sectionId: 'INFRASTRUCTURE'
          })}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span>{environment}</span>
          {infra ? <span>&nbsp;({infra})</span> : null}
        </Link>
      </Layout.Horizontal>
    </Layout.Horizontal>
  ) : null
}
