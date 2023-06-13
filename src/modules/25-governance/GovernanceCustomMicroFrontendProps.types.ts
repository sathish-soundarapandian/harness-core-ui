/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type GitFilters from '@common/components/GitFilters/GitFilters'
import type { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { GitSyncStoreProvider, useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { useAppStore } from 'framework/AppStore/AppStoreContext'
import type RbacButton from '@rbac/components/Button/Button'
import type RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import type { usePermission } from '@rbac/hooks/usePermission'
import type { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { useGetSchemaYaml, useGetPipeline, useGetPipelineList } from 'services/pipeline-ng'
import type {
  useGetConnectorListV2,
  useGetListOfBranchesWithStatus,
  useGetOrganizationList,
  useGetProjectList
} from 'services/cd-ng'
import SessionToken from 'framework/utils/SessionToken'
import type { useAnyEnterpriseLicense, useCurrentEnterpriseLicense } from '@common/hooks/useModuleLicenses'
import type { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { OverviewChartsWithToggle } from '@common/components/OverviewChartsWithToggle/OverviewChartsWithToggle'
import type RepositorySelect from '@common/components/RepositorySelect/RepositorySelect'
import type RepoBranchSelectV2 from '@common/components/RepoBranchSelectV2/RepoBranchSelectV2'
import type { InlineRemoteSelect } from '@common/components/InlineRemoteSelect/InlineRemoteSelect'
import type GitRemoteDetails from '@common/components/GitRemoteDetails/GitRemoteDetails'
import type { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import type { isOnPrem } from '@common/utils/utils'
import type { useGetResourceGroupListV2 } from 'services/resourcegroups'
import type { getSelectedScopeLabel, useGetResourceTypeHandler } from '@rbac/pages/ResourceGroupDetails/utils'
import type routes from '@common/RouteDefinitions'

const { getToken: useGetToken } = SessionToken

export interface GovernanceCustomMicroFrontendProps {
  customHooks: {
    usePermission: typeof usePermission
    useGetSchemaYaml: typeof useGetSchemaYaml
    useFeatureFlags: typeof useFeatureFlags
    useAppStore: typeof useAppStore
    useGitSyncStore: typeof useGitSyncStore
    useSaveToGitDialog: typeof useSaveToGitDialog
    useGetListOfBranchesWithStatus: typeof useGetListOfBranchesWithStatus
    useGetToken: typeof useGetToken
    useAnyEnterpriseLicense: typeof useAnyEnterpriseLicense
    useCurrentEnterpriseLicense: typeof useCurrentEnterpriseLicense
    useLicenseStore: typeof useLicenseStore
    useGetPipelineList: typeof useGetPipelineList
    useGetPipeline: typeof useGetPipeline
    useGetOrganizationList: typeof useGetOrganizationList
    useGetProjectList: typeof useGetProjectList
    isOnPrem: typeof isOnPrem
    useGetConnectorListV2: typeof useGetConnectorListV2
    useGetResourceGroupListV2: typeof useGetResourceGroupListV2
    useGetResourceTypeHandler: typeof useGetResourceTypeHandler
    getSelectedScopeLabel: typeof getSelectedScopeLabel
  }
  customComponents: {
    NGBreadcrumbs: typeof NGBreadcrumbs
    RbacButton: typeof RbacButton
    RbacOptionsMenuButton: typeof RbacOptionsMenuButton
    GitFilters: typeof GitFilters
    GitSyncStoreProvider: typeof GitSyncStoreProvider
    OverviewChartsWithToggle: typeof OverviewChartsWithToggle
    RepositorySelect: typeof RepositorySelect
    RepoBranchSelectV2: typeof RepoBranchSelectV2
    InlineRemoteSelect: typeof InlineRemoteSelect
    GitRemoteDetails: typeof GitRemoteDetails
    ErrorHandler: typeof ErrorHandler
  }
  customRoutes: typeof routes
  baseRoutePath: string
}
