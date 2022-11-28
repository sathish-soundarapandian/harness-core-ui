/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Link, useParams } from 'react-router-dom'
import { Popover, Position } from '@blueprintjs/core'
import { Icon } from '@harness/icons'
import { Layout, Text } from '@harness/uicore'
import { String } from 'framework/strings'
import type { Application } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import css from './CDExecutionSummary.module.scss'

interface GitOpsApplicationsListProps {
  applications: Application[]
  className?: string
  limit?: number
}

export function GitOpsApplicationsList({
  applications,
  limit = 2,
  className
}: GitOpsApplicationsListProps): React.ReactElement {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  return (
    <div className={cx(css.main, className)}>
      <>
        <div className={css.gitOpsApps}>
          <Icon name="gitops-application" className={css.appIcon} size={14} />
          <Text>
            {applications.slice(0, limit).map((app: Application, index: number) => {
              return (
                <Link
                  key={index}
                  onClick={e => e.stopPropagation()}
                  to={routes.toGitOpsApplication({
                    orgIdentifier,
                    projectIdentifier,
                    accountId,
                    module,
                    applicationId: (app.identifier || app.name) as string,
                    agentId: app.agentIdentifier
                  })}
                >
                  <Text>{app.name}</Text>
                </Link>
              )
            })}
          </Text>
        </div>
        {applications.length > limit ? (
          <>
            ,&nbsp;
            <Popover
              wrapperTagName="div"
              targetTagName="div"
              interactionKind="hover"
              position={Position.RIGHT}
              className={css.serviceWrapper}
            >
              <String
                tagName="div"
                className={cx(css.serviceName, css.count)}
                stringID={'common.plusNumberNoSpace'}
                vars={{ number: Math.abs(applications.length - limit) }}
              />
              <Layout.Vertical padding="small">
                {applications.slice(limit).map((app, index) => (
                  <Link
                    key={index}
                    onClick={e => e.stopPropagation()}
                    to={routes.toGitOpsApplication({
                      orgIdentifier,
                      projectIdentifier,
                      accountId,
                      module,
                      applicationId: (app.identifier || app.name) as string,
                      agentId: app.agentIdentifier
                    })}
                  >
                    <Text>{app.name}</Text>
                  </Link>
                ))}
              </Layout.Vertical>
            </Popover>
          </>
        ) : null}
      </>
    </div>
  )
}
