/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import type { Color } from '@harness/design-system'
import { Text } from '@harness/uicore'
import type { Application } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export const linkNode = (
  app: Application,
  {
    index,
    color,
    lineClamp = 1,
    orgIdentifier,
    projectIdentifier,
    accountId,
    module
  }: {
    index: number
    color: Color
    lineClamp?: number
  } & ProjectPathProps &
    ModulePathParams
) => {
  return (
    <Link
      key={app.identifier || app.name}
      onClick={/* istanbul ignore next */ e => e.stopPropagation()}
      to={routes.toGitOpsApplication({
        orgIdentifier,
        projectIdentifier,
        accountId,
        module,
        applicationId: (app.identifier || app.name) as string,
        agentId: app.agentIdentifier
      })}
    >
      <Text color={color} key={app.identifier || index} style={{ maxWidth: '200px' }} lineClamp={lineClamp}>
        {app.name}
      </Text>
    </Link>
  )
}
