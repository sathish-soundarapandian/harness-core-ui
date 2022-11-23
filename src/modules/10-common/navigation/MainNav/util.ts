/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import { ModuleName } from 'framework/types/ModuleName'
import {
  BuildsNavItem,
  ChaosNavItem,
  CloudCostsNavItem,
  DeploymentsNavItem,
  FeatureFlagsNavItem,
  SCMNavItem,
  SRMNavItem,
  STONavItem
} from './ModuleLinks'

export const moduleToNavItemsMap: Record<NavModuleName, () => JSX.Element> = {
  [ModuleName.CD]: DeploymentsNavItem,
  [ModuleName.CI]: BuildsNavItem,
  [ModuleName.CF]: FeatureFlagsNavItem,
  [ModuleName.CE]: CloudCostsNavItem,
  [ModuleName.CV]: SRMNavItem,
  [ModuleName.CHAOS]: ChaosNavItem,
  [ModuleName.STO]: STONavItem,
  [ModuleName.CODE]: SCMNavItem
}
