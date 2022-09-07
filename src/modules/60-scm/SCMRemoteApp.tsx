/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Suspense, lazy } from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { usePermission } from '@rbac/hooks/usePermission'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import SessionToken from 'framework/utils/SessionToken'
import { useAnyEnterpriseLicense, useCurrentEnterpriseLicense } from '@common/hooks/useModuleLicenses'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { global401HandlerUtils } from '@common/utils/global401HandlerUtils'
import type { RemoteViewProps } from './SCMUtils'

// eslint-disable-next-line import/no-unresolved
const RemoteSCMApp = lazy(() => import('scm/App'))

// eslint-disable-next-line import/no-unresolved
const RemoteWelcomeView = lazy(() => import('scm/Welcome'))

const RemoteComponentMounter: React.FC<{
  spinner?: JSX.Element
  component: JSX.Element
}> = ({ spinner, component }) => {
  const { getString } = useStrings()
  const { path, params } = useRouteMatch<{ accountId: string }>()
  const history = useHistory()
  const { getToken: useGetToken } = SessionToken

  return (
    <Suspense fallback={spinner || <Container padding="large">{getString('loading')}</Container>}>
      <AppErrorBoundary>
        <RemoteSCMApp
          baseRoutePath={path}
          accountId={params.accountId}
          on401={() => {
            global401HandlerUtils(history)
          }}
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

export const WelcomeView: React.FC<RemoteViewProps> = props => (
  <RemoteComponentMounter component={<RemoteWelcomeView {...props} />} />
)
