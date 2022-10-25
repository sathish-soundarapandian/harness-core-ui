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
import { useGetEnvironment as useCDGetEnvironment } from 'services/cd-ng'
import { useConfirmAction } from '@common/hooks'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { useSyncedEnvironment } from '@cf/hooks/useSyncedEnvironment'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import routes from '@common/RouteDefinitions'
import SectionNoData from '@cf/components/NoData/SectionNoData/SectionNoData'
import { NameSchema } from '@common/utils/Validation'
import { getIdentifierFromName } from '@common/utils/StringUtils'
import { EnvironmentSDKKeyType } from '@cf/utils/CFUtils'
import * as trackingConstants from '@common/constants/TrackingConstants'

// eslint-disable-next-line import/no-unresolved
const FFUIMFEApp = lazy(() => import('ffui/MicroFrontendApp'))

const FFUIApp: FC = () => (
  <ChildAppMounter<FFCustomMicroFrontendProps>
    ChildApp={FFUIMFEApp}
    ffServices={{ ...ffServices, useCDGetEnvironment }}
    customHooks={{ useConfirmAction, useActiveEnvironment, useSyncedEnvironment }}
    customComponents={{ RbacOptionsMenuButton, ContainerSpinner, SectionNoData }}
    customRoutes={routes}
    customUtils={{ NameSchema, getIdentifierFromName }}
    customEnums={{ EnvironmentSDKKeyType, trackingConstants }}
  />
)

export default FFUIApp
