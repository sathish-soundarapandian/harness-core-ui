/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, lazy } from 'react'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type { FFCustomMicroFrontendProps } from '@cf/FFCustomMicroFrontendProps.types'
import * as ffServices from 'services/cf'
import {
  useGetEnvironment as useCDGetEnvironment,
  useGetEnvironmentListForProject as useCDGetEnvironmentListForProject,
  useDeleteEnvironmentV2 as useCDDeleteEnvironment,
  useCreateEnvironment as useCDCreateEnvironment
} from 'services/cd-ng'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useConfirmAction } from '@common/hooks'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { Description } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import routes from '@common/RouteDefinitions'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import * as trackingConstants from '@common/constants/TrackingConstants'

// eslint-disable-next-line import/no-unresolved
const FFUIMFEApp = lazy(() => import('ffui/MicroFrontendApp'))

const FFUIApp: FC = () => (
  <ChildAppMounter<FFCustomMicroFrontendProps>
    ChildApp={FFUIMFEApp}
    ffServices={{
      ...ffServices,
      useCDGetEnvironmentListForProject,
      useCDGetEnvironment,
      useCDDeleteEnvironment,
      useCDCreateEnvironment
    }}
    customHooks={{ useConfirmAction, useActiveEnvironment, useLicenseStore, useSyncedEnvironment }}
    customComponents={{ RbacOptionsMenuButton, ContainerSpinner, Description }}
    customRoutes={routes}
    customUtils={{ NameSchema, getIdentifierFromName, IdentifierSchema }}
    customEnums={{ FeatureIdentifier, trackingConstants }}
  />
)

export default FFUIApp
