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
import type { useConfirmAction } from '@common/hooks'
import type { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import type RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import type routes from '@common/RouteDefinitions'
import type { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import type { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { getIdentifierFromName } from '@common/utils/StringUtils'
import type * as trackingConstants from '@common/constants/TrackingConstants'
import type useActiveEnvironment from './hooks/useActiveEnvironment'
import type SectionNoData from './components/NoData/SectionNoData/SectionNoData'
import type { EnvironmentSDKKeyType } from './utils/CFUtils'

export interface FFCustomMicroFrontendProps {
  ffServices: typeof ffServices & {
    useCDGetEnvironment: typeof useGetEnvironment
    useCDGetEnvironmentListForProject: typeof useGetEnvironmentListForProject
    useCDCreateEnvironment: typeof useCreateEnvironment
    useCDDeleteEnvironment: typeof useDeleteEnvironmentV2
  }
  customHooks: {
    useConfirmAction: typeof useConfirmAction
    useLicenseStore: typeof useLicenseStore
    useSyncedEnvironment: typeof useSyncedEnvironment
    useActiveEnvironment: typeof useActiveEnvironment
  }
  customComponents: {
    RbacOptionsMenuButton: typeof RbacOptionsMenuButton
    ContainerSpinner: typeof ContainerSpinner
    SectionNoData: typeof SectionNoData
  }
  customRoutes: typeof routes
  customUtils: {
    IdentifierSchema: typeof IdentifierSchema
    NameSchema: typeof NameSchema
    getIdentifierFromName: typeof getIdentifierFromName
  }
  customEnums: {
    EnvironmentSDKKeyType: typeof EnvironmentSDKKeyType
    FeatureIdentifier: typeof FeatureIdentifier
    trackingConstants: typeof trackingConstants
  }
}
