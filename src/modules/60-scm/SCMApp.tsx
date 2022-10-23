/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Suspense, lazy, useMemo } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import RbacButton from '@rbac/components/Button/Button'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { usePermission } from '@rbac/hooks/usePermission'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import SessionToken from 'framework/utils/SessionToken'
import { useAnyEnterpriseLicense, useCurrentEnterpriseLicense } from '@common/hooks/useModuleLicenses'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { global401HandlerUtils } from '@common/utils/global401HandlerUtils'
import type { RemoteViewProps } from './SCMUtils'

// eslint-disable-next-line import/no-unresolved
const RemoteSCMApp = lazy(() => import('scm/App'))

// eslint-disable-next-line import/no-unresolved
const RemoteRepositoriesListing = lazy(() => import('scm/RepositoriesListing'))

// eslint-disable-next-line import/no-unresolved
const RemoteRepository = lazy(() => import('scm/Repository'))

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
          apiToken={useGetToken()}
          routes={pick(routes, ['toSCM', 'toSCMHome', 'toSCMRepositoriesListing', 'toSCMRepository'])}
          hooks={{
            usePermission,
            useFeatureFlags,
            useAppStore,
            useGetToken,
            useAnyEnterpriseLicense,
            useCurrentEnterpriseLicense,
            useLicenseStore
          }}
          components={{
            RbacButton,
            RbacOptionsMenuButton
          }}
        >
          {component}
        </RemoteSCMApp>
      </AppErrorBoundary>
    </Suspense>
  )
}

export const RemoteRepos: React.FC<RemoteViewProps> = props => (
  <SCMRemoteComponentMounter component={<RemoteRepositoriesListing {...props} />} />
)

export const RemoteRepoResources: React.FC<RemoteViewProps> = props => (
  <SCMRemoteComponentMounter component={<RemoteRepository {...props} />} />
)
