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
import type { useConfirmAction, useQueryParams } from '@common/hooks'
import type { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import type { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import type RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import type routes from '@common/RouteDefinitions'
import type { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { Description } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { getIdentifierFromName } from '@common/utils/StringUtils'
import type * as trackingConstants from '@common/constants/TrackingConstants'
import type useActiveEnvironment from './hooks/useActiveEnvironment'

export interface FFCustomMicroFrontendProps {
  ffServices: typeof ffServices & {
    useCDGetEnvironment: typeof useGetEnvironment
    useCDGetEnvironmentListForProject: typeof useGetEnvironmentListForProject
    useCDCreateEnvironment: typeof useCreateEnvironment
    useCDDeleteEnvironment: typeof useDeleteEnvironmentV2
  }
  customHooks: {
    useConfirmAction: typeof useConfirmAction
    useQueryParams: typeof useQueryParams
    useLicenseStore: typeof useLicenseStore
    useSyncedEnvironment: typeof useSyncedEnvironment
    useActiveEnvironment: typeof useActiveEnvironment
    usePreferenceStore: typeof usePreferenceStore
  }
  customComponents: {
    RbacOptionsMenuButton: typeof RbacOptionsMenuButton
    ContainerSpinner: typeof ContainerSpinner
    Description: typeof Description
  }
  customRoutes: typeof routes
  customUtils: {
    IdentifierSchema: typeof IdentifierSchema
    NameSchema: typeof NameSchema
    getIdentifierFromName: typeof getIdentifierFromName
  }
  customEnums: {
    FeatureIdentifier: typeof FeatureIdentifier
    trackingConstants: typeof trackingConstants
    PreferenceScope: typeof PreferenceScope
  }
}
