/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type * as ffServices from 'services/cf'
import type {
  useCreateEnvironment,
  useDeleteEnvironmentV2,
  useGetEnvironment,
  useGetEnvironmentListForProject
} from 'services/cd-ng'
import type { useConfirmAction, useLocalStorage, useQueryParams } from '@common/hooks'
import type { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import type { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import type { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import type RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import type RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import type routes from '@common/RouteDefinitions'
import type { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { EvaluationModal } from '@governance/EvaluationModal'
import type { Description } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { getIdentifierFromName } from '@common/utils/StringUtils'
import type { GitSyncForm } from '@gitsync/components/GitSyncForm/GitSyncForm'
import type * as trackingConstants from '@common/constants/TrackingConstants'
import type MonacoDiffEditor from '@common/components/MonacoDiffEditor/MonacoDiffEditor'
import type useActiveEnvironment from './hooks/useActiveEnvironment'

export interface FFCustomMicroFrontendProps {
  ffServices: typeof ffServices & {
    useCDCreateEnvironment: typeof useCreateEnvironment
    useCDDeleteEnvironment: typeof useDeleteEnvironmentV2
    useCDGetEnvironment: typeof useGetEnvironment
    useCDGetEnvironmentListForProject: typeof useGetEnvironmentListForProject
  }
  customHooks: {
    useActiveEnvironment: typeof useActiveEnvironment
    useConfirmAction: typeof useConfirmAction
    useLicenseStore: typeof useLicenseStore
    useLocalStorage: typeof useLocalStorage
    useQueryParams: typeof useQueryParams
    useQueryParamsState: typeof useQueryParamsState
    usePreferenceStore: typeof usePreferenceStore
    useSyncedEnvironment: typeof useSyncedEnvironment
  }
  customComponents: {
    ContainerSpinner: typeof ContainerSpinner
    Description: typeof Description
    EvaluationModal: typeof EvaluationModal
    FeatureWarningTooltip: typeof FeatureWarningTooltip
    GitSyncForm: typeof GitSyncForm
    MonacoDiffEditor: typeof MonacoDiffEditor
    RbacOptionsMenuButton: typeof RbacOptionsMenuButton
    RBACTooltip: typeof RBACTooltip
  }
  customRoutes: typeof routes
  customUtils: {
    getIdentifierFromName: typeof getIdentifierFromName
    IdentifierSchema: typeof IdentifierSchema
    NameSchema: typeof NameSchema
  }
  customEnums: {
    FeatureIdentifier: typeof FeatureIdentifier
    PreferenceScope: typeof PreferenceScope
    trackingConstants: typeof trackingConstants
  }
}
