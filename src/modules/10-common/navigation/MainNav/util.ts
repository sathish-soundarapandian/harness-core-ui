/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DEFAULT_MODULES_ORDER, NavModuleName, useNavModuleInfoReturnType } from '@common/hooks/useNavModuleInfo'
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

export const filterNavModules = (
  orderedModules: NavModuleName[],
  selectedModules: NavModuleName[],
  moduleMap: Record<NavModuleName, useNavModuleInfoReturnType>
) => {
  let filteredOrderedModules: NavModuleName[] = []
  let filteredSelectedModules: NavModuleName[] = []
  // default condition when there are no modules in local storage
  if (!orderedModules.length) {
    filteredOrderedModules = DEFAULT_MODULES_ORDER
    filteredSelectedModules = DEFAULT_MODULES_ORDER.filter(module => !!moduleMap[module].hasLicense)
  }

  // If any module is removed from code, remove it from local storage
  filteredOrderedModules = orderedModules.filter(orderedModule =>
    DEFAULT_MODULES_ORDER.find(defaultModule => defaultModule === orderedModule)
  )

  // if any new modules are added, update ordered modules
  const newModules = DEFAULT_MODULES_ORDER.filter(
    defaultModule => !orderedModules.find(orderedModule => defaultModule === orderedModule)
  )

  if (newModules.length) {
    filteredOrderedModules = [...filteredOrderedModules, ...newModules]
  }

  if (selectedModules.length) {
    // Remove modules from the selected modules if the feature flag of that module gets turned off
    filteredSelectedModules = selectedModules.filter(
      module => moduleMap[module]?.shouldVisible && filteredOrderedModules.indexOf(module) > -1
    )
  }

  return { orderedModules: filteredOrderedModules, selectedModules: filteredSelectedModules }
}
