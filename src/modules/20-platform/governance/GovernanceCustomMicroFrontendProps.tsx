/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import GitFilters from '@common/components/GitFilters/GitFilters'
import { isOnPrem } from '@common/utils/utils'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { GitSyncStoreProvider, useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import RbacButton from '@rbac/components/Button/Button'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { usePermission } from '@rbac/hooks/usePermission'
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
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import SessionToken from 'framework/utils/SessionToken'
import { useAnyEnterpriseLicense, useCurrentEnterpriseLicense } from '@common/hooks/useModuleLicenses'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { OverviewChartsWithToggle } from '@common/components/OverviewChartsWithToggle/OverviewChartsWithToggle'

export interface RouteMatch {
  path: string
  params: { accountId: string }
}

const { getToken: useGetToken } = SessionToken

const customHooks = {
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
}

const customComponents = {
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
}

export { customHooks, customComponents }
