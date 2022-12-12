/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import { Classes, PopoverInteractionKind } from '@blueprintjs/core'
import { Icon, Layout, Popover, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { Application } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

function GitOpsExecutionSummary({ stageInfo, limit = 1 }: { stageInfo: Record<string, any>; limit?: number }) {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const gitOpsApplications = stageInfo.gitOpsAppSummary?.applications || []

  const linkNode = (app: Application, index: number, color: Color, lineClamp = 1) => {
    return (
      <Link
        key={app.identifier || app.name}
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
        <Text
          font={{ variation: FontVariation.SMALL_SEMI }}
          color={color}
          key={app.identifier || index}
          style={{ maxWidth: '200px' }}
          lineClamp={lineClamp}
        >
          {app.name}
        </Text>
      </Link>
    )
  }

  return gitOpsApplications.length ? (
    <Layout.Horizontal>
      <Layout.Horizontal
        spacing="xsmall"
        style={{ alignItems: 'center' }}
        margin={{ left: 'small' }}
        padding={{ left: 'xsmall' }}
      >
        <Icon name="gitops-application" size={14} />
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
          {getString('applications')}:
        </Text>
        <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
          {gitOpsApplications.slice(0, limit).map((app: Application, index: number) => {
            return linkNode(app, index, Color.GREY_800)
          })}
        </Text>
        {gitOpsApplications.length > limit ? (
          <>
            <Popover
              interactionKind={PopoverInteractionKind.HOVER}
              className={Classes.DARK}
              content={
                <Layout.Vertical spacing="small" padding="medium" style={{ maxWidth: 500 }}>
                  {gitOpsApplications
                    .slice(limit)
                    .map((app: Application, index: number) => linkNode(app, index, Color.WHITE, 3))}
                </Layout.Vertical>
              }
            >
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_800}>
                ,&nbsp;+{Math.abs(gitOpsApplications.length - limit)}
              </Text>
            </Popover>
          </>
        ) : null}
      </Layout.Horizontal>
    </Layout.Horizontal>
  ) : null
}

export default GitOpsExecutionSummary
