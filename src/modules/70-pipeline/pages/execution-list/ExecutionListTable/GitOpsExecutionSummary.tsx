/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { Link, useParams } from 'react-router-dom'
import { groupBy } from 'lodash-es'
import { Color } from '@harness/design-system'
import { Classes, PopoverInteractionKind } from '@blueprintjs/core'
import { Icon, Layout, Popover } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import type { Application, Cluster, Environment } from 'services/cd-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import { linkNode } from './gitopsRenderer'
import css from './ExecutionListTable.module.scss'

function GitOpsExecutionSummary({ stageInfo }: { stageInfo: Record<string, any> }) {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const gitOpsApplications = stageInfo.gitOpsAppSummary?.applications || []
  const gitopsAppsLength = gitOpsApplications.length

  const environments: Environment[] = stageInfo.gitopsExecutionSummary?.environments || []
  const firstEnvId = environments[0]?.identifier
  const clustersByEnvId = groupBy(stageInfo.gitopsExecutionSummary?.clusters, 'envId')
  const gitopsEnvsLength = environments.length
  const firstEnvClusters = clustersByEnvId[firstEnvId || ''] || []

  return gitopsAppsLength || gitopsEnvsLength ? (
    <Layout.Horizontal margin={{ left: 'small' }} className={css.gitOpsExecutionSummary}>
      {gitopsEnvsLength ? (
        <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center', marginRight: '12px' }}>
          <Icon name="environments" size={12} />
          <Link
            onClick={/* istanbul ignore next */ e => e.stopPropagation()}
            to={routes.toEnvironmentDetails({
              accountId,
              module,
              orgIdentifier,
              projectIdentifier,
              sectionId: 'GITOPS',
              environmentIdentifier: getIdentifierFromScopedRef(firstEnvId || '')
            })}
          >
            <span>{environments[0].name || firstEnvId}</span>
          </Link>
          {firstEnvClusters.length && gitopsEnvsLength === 1 ? (
            <span className={css.primary6}>
              <span>({firstEnvClusters[0]?.clusterName || firstEnvClusters[0]?.clusterId}</span>
              {firstEnvClusters.length > 1 ? (
                <Popover
                  interactionKind={PopoverInteractionKind.HOVER}
                  className={Classes.DARK}
                  content={
                    <Layout.Vertical spacing="small" padding="medium" style={{ maxWidth: 500, color: Color.WHITE }}>
                      {firstEnvClusters
                        .slice(1)
                        .map((cluster: Cluster) => cluster?.clusterName || cluster?.clusterId)
                        .join(', ')}
                    </Layout.Vertical>
                  }
                >
                  <>
                    &nbsp;
                    <span className={classnames(css.primary6)} style={{ textDecoration: 'underline dotted' }}>
                      +{Math.abs(firstEnvClusters.length - 1)}
                    </span>
                  </>
                </Popover>
              ) : null}
              <span className={classnames(css.marginLeftZero)}>)</span>
            </span>
          ) : null}
          {gitopsEnvsLength > 1 ? (
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              className={Classes.DARK}
              content={
                <Layout.Vertical spacing="small" padding="medium" style={{ maxWidth: 500 }}>
                  {environments.map((env: Environment, index: number) => {
                    const envName = env.name || env.identifier
                    const clusters = clustersByEnvId[env.identifier || '']
                    return (
                      <div key={index}>
                        <Link
                          onClick={/* istanbul ignore next */ e => e.stopPropagation()}
                          to={routes.toEnvironmentDetails({
                            accountId,
                            module,
                            orgIdentifier,
                            projectIdentifier,
                            sectionId: 'GITOPS',
                            environmentIdentifier: getIdentifierFromScopedRef(env.identifier || '')
                          })}
                        >
                          <span>{envName}</span>
                        </Link>
                        {clusters?.length ? (
                          <>
                            <span style={{ color: Color.WHITE }}>
                              &nbsp;({clusters.map(cluster => cluster.clusterName || cluster.clusterId).join(', ')})
                            </span>
                          </>
                        ) : null}
                      </div>
                    )
                  })}
                </Layout.Vertical>
              }
            >
              <span className={css.primary6} style={{ textDecoration: 'underline dotted' }}>
                +{Math.abs(environments.length - 1)}
              </span>
            </Popover>
          ) : null}
        </Layout.Horizontal>
      ) : null}
      {gitopsAppsLength ? (
        <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
          <Icon name="gitops-application" size={14} />
          {linkNode(gitOpsApplications[0], {
            index: 0,
            color: Color.PRIMARY_6,
            orgIdentifier,
            projectIdentifier,
            accountId,
            module
          })}
          {gitOpsApplications.length > 1 ? (
            <>
              <Popover
                interactionKind={PopoverInteractionKind.HOVER}
                className={Classes.DARK}
                content={
                  <Layout.Vertical spacing="small" padding="medium" style={{ maxWidth: 500 }}>
                    {gitOpsApplications.slice(1).map((app: Application, index: number) =>
                      linkNode(app, {
                        index,
                        color: Color.PRIMARY_5,
                        lineClamp: 3,
                        orgIdentifier,
                        projectIdentifier,
                        accountId,
                        module
                      })
                    )}
                  </Layout.Vertical>
                }
              >
                <span className={css.primary6} style={{ textDecoration: 'underline dotted' }}>
                  +{Math.abs(gitOpsApplications.length - 1)}
                </span>
              </Popover>
            </>
          ) : null}
        </Layout.Horizontal>
      ) : null}
    </Layout.Horizontal>
  ) : null
}

export default GitOpsExecutionSummary
