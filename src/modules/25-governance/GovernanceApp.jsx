/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Suspense, lazy } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { Container } from '@harness/uicore'
import { useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import GitFilters from '@common/components/GitFilters/GitFilters'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { isOnPrem } from '@common/utils/utils'
import AppErrorBoundary from 'framework/utils/AppErrorBoundary/AppErrorBoundary'
import { useStrings } from 'framework/strings'
import { GitSyncStoreProvider, useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { usePermission } from '@rbac/hooks/usePermission'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useGetSchemaYaml, useGetPipeline, useGetPipelineList } from 'services/pipeline-ng'
import {
  useGetListOfBranchesWithStatus,
  useGetOrganizationList,
  useGetProjectList,
  useGetConnectorListV2
} from 'services/cd-ng'
import RepositorySelect from '@common/components/RepositorySelect/RepositorySelect'
import RepoBranchSelectV2 from '@common/components/RepoBranchSelectV2/RepoBranchSelectV2'
import { InlineRemoteSelect } from '@common/components/InlineRemoteSelect/InlineRemoteSelect'
import GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import SessionToken from 'framework/utils/SessionToken'
import { useAnyEnterpriseLicense, useCurrentEnterpriseLicense } from '@common/hooks/useModuleLicenses'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { OverviewChartsWithToggle } from '@common/components/OverviewChartsWithToggle/OverviewChartsWithToggle'
import { useLogout } from 'framework/utils/SessionUtils'

// Due to some typing complexity, governance/App is lazily imported
// from a .js file for now
const RemoteGovernanceApp = lazy(() => import('governance/App'))

export const RemoteEvaluationModal = lazy(() => import('governance/EvaluationModal'))
export const RemotePipelineGovernanceView = lazy(() => import('governance/PipelineGovernanceView'))
export const RemoteEvaluationView = lazy(() => import('governance/EvaluationView'))
export const RemotePolicySetWizard = lazy(() => import('governance/PolicySetWizard'))

export const GovernanceRemoteComponentMounter = props => {
  const { spinner, component } = props
  const { getString } = useStrings()
  const { path, params } = useRouteMatch()
  const { forceLogout } = useLogout()
  const { getToken: useGetToken } = SessionToken

  return (
    <Suspense fallback={spinner || <Container padding="large">{getString('loading')}</Container>}>
      <AppErrorBoundary>
        <RemoteGovernanceApp
          baseRoutePath={path}
          accountId={params.accountId}
          on401={() => {
            forceLogout()
          }}
          hooks={{
            usePermission,
            useGetSchemaYaml,
            useFeatureFlags,
            useAppStore,
            useGitSyncStore,
            useSaveToGitDialog,
            useGetListOfBranchesWithStatus,
            useGetToken,
            useAnyEnterpriseLicense,
            useCurrentEnterpriseLicense,
            useLicenseStore,
            useGetPipelineList,
            useGetPipeline,
            useGetOrganizationList,
            useGetProjectList,
            isOnPrem,
            useGetConnectorListV2
          }}
          components={{
            NGBreadcrumbs,
            RbacButton,
            RbacOptionsMenuButton,
            GitFilters,
            GitSyncStoreProvider,
            OverviewChartsWithToggle,
            RepositorySelect,
            RepoBranchSelectV2,
            InlineRemoteSelect,
            GitRemoteDetails,
            ErrorHandler
          }}
        >
          {component}
        </RemoteGovernanceApp>
      </AppErrorBoundary>
    </Suspense>
  )
}
