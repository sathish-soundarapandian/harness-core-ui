/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Suspense, lazy, useMemo } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Container } from '@harness/uicore'
import { pick } from 'lodash-es'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import SessionToken from 'framework/utils/SessionToken'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { global401HandlerUtils } from '@common/utils/global401HandlerUtils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RemoteViewProps = Record<string, any>

// eslint-disable-next-line import/no-unresolved
const RemoteCodeApp = lazy(() => import('code/App'))

// eslint-disable-next-line import/no-unresolved
const RemoteRepositories = lazy(() => import('code/Repositories'))

// eslint-disable-next-line import/no-unresolved
const RemoteRepository = lazy(() => import('code/Repository'))

// eslint-disable-next-line import/no-unresolved
const RemoteFileEdit = lazy(() => import('code/FileEdit'))

// eslint-disable-next-line import/no-unresolved
const RemoteCommits = lazy(() => import('code/Commits'))

// eslint-disable-next-line import/no-unresolved
const RemoteBranches = lazy(() => import('code/Branches'))

// eslint-disable-next-line import/no-unresolved
const RemoteSettings = lazy(() => import('code/Settings'))

// eslint-disable-next-line import/no-unresolved
const RemotePullRequests = lazy(() => import('code/PullRequests'))

// eslint-disable-next-line import/no-unresolved
const RemotePullRequestsCompare = lazy(() => import('code/PullRequestsCompare'))

const exportedRoutes = pick(routes, [
  'toCODERepositories',
  'toCODERepository',
  'toCODEFileEdit',
  'toCODECommits',
  'toCODEBranches',
  'toCODEPullRequests',
  'toCODEPullRequestsCompare',
  'toCODESettings'
])

const CODERemoteComponentMounter: React.FC<{
  component: JSX.Element
}> = ({ component }) => {
  const { getString } = useStrings()
  const { params } = useRouteMatch<ProjectPathProps>()
  const space = useMemo(
    () => `${params.accountId}/${params.orgIdentifier}/${params.projectIdentifier}`,
    [params.accountId, params.orgIdentifier, params.projectIdentifier]
  )
  const history = useHistory()
  const { getToken: useGetToken } = SessionToken

  return (
    <Suspense fallback={<Container padding="large">{getString('loading')}</Container>}>
      <AppErrorBoundary>
        <RemoteCodeApp
          space={space}
          on401={() => {
            global401HandlerUtils(history)
          }}
          routes={exportedRoutes}
          hooks={{
            useGetToken
          }}
        >
          {component}
        </RemoteCodeApp>
      </AppErrorBoundary>
    </Suspense>
  )
}

export const Repositories: React.FC<RemoteViewProps> = props => (
  <CODERemoteComponentMounter component={<RemoteRepositories {...props} />} />
)

export const Repository: React.FC<RemoteViewProps> = props => (
  <CODERemoteComponentMounter component={<RemoteRepository {...props} />} />
)

export const FileEdit: React.FC<RemoteViewProps> = props => (
  <CODERemoteComponentMounter component={<RemoteFileEdit {...props} />} />
)

export const Commits: React.FC<RemoteViewProps> = props => (
  <CODERemoteComponentMounter component={<RemoteCommits {...props} />} />
)

export const Branches: React.FC<RemoteViewProps> = props => (
  <CODERemoteComponentMounter component={<RemoteBranches {...props} />} />
)

export const Settings: React.FC<RemoteViewProps> = props => (
  <CODERemoteComponentMounter component={<RemoteSettings {...props} />} />
)

export const PullRequests: React.FC<RemoteViewProps> = props => (
  <CODERemoteComponentMounter component={<RemotePullRequests {...props} />} />
)

export const PullRequestsCompare: React.FC<RemoteViewProps> = props => (
  <CODERemoteComponentMounter component={<RemotePullRequestsCompare {...props} />} />
)
