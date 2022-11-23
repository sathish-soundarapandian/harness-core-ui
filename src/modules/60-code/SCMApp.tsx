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
import type { RemoteViewProps } from './SCMUtils'

// eslint-disable-next-line import/no-unresolved
const RemoteSCMApp = lazy(() => import('code/App'))

// eslint-disable-next-line import/no-unresolved
const RemoteRepositoriesListing = lazy(() => import('code/RepositoriesListing'))

// eslint-disable-next-line import/no-unresolved
const RemoteRepository = lazy(() => import('code/Repository'))

// eslint-disable-next-line import/no-unresolved
const RemoteRepositoryFileEdit = lazy(() => import('code/RepositoryFileEdit'))

// eslint-disable-next-line import/no-unresolved
const RemoteRepositoryCommits = lazy(() => import('code/RepositoryCommits'))

// eslint-disable-next-line import/no-unresolved
const RemoteRepositoryBranches = lazy(() => import('code/RepositoryBranches'))
// eslint-disable-next-line import/no-unresolved
const RemoteRepositorySettings = lazy(() => import('code/RepositorySettings'))

const exportedRoutes = pick(routes, [
  'toSCM',
  'toSCMHome',
  'toSCMRepositoriesListing',
  'toSCMRepository',
  'toSCMRepositoryFileEdit',
  'toSCMRepositoryCommits',
  'toSCMRepositoryBranches',
  'toSCMRepositorySettings'
])

const SCMRemoteComponentMounter: React.FC<{
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
        <RemoteSCMApp
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
        </RemoteSCMApp>
      </AppErrorBoundary>
    </Suspense>
  )
}

export const RepositoriesListing: React.FC<RemoteViewProps> = props => (
  <SCMRemoteComponentMounter component={<RemoteRepositoriesListing {...props} />} />
)

export const Repository: React.FC<RemoteViewProps> = props => (
  <SCMRemoteComponentMounter component={<RemoteRepository {...props} />} />
)

export const RepositoryFileEdit: React.FC<RemoteViewProps> = props => (
  <SCMRemoteComponentMounter component={<RemoteRepositoryFileEdit {...props} />} />
)

export const RepositoryCommits: React.FC<RemoteViewProps> = props => (
  <SCMRemoteComponentMounter component={<RemoteRepositoryCommits {...props} />} />
)

export const RepositoryBranches: React.FC<RemoteViewProps> = props => (
  <SCMRemoteComponentMounter component={<RemoteRepositoryBranches {...props} />} />
)

export const RepositorySettings: React.FC<RemoteViewProps> = props => (
  <SCMRemoteComponentMounter component={<RemoteRepositorySettings {...props} />} />
)
