/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { NavModuleName } from '@common/hooks/useNavModuleInfo'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleInfo } from './types'

export const DEFAULT_MODULES_ORDER: NavModuleName[] = [
  ModuleName.CD,
  ModuleName.CI,
  ModuleName.CF,
  ModuleName.CE,
  ModuleName.CV,
  ModuleName.STO,
  ModuleName.CHAOS
]

export const moduleConfig: Record<ModuleName, ModuleInfo | undefined> = {
  CD: {
    label: 'Deployments',
    icon: 'cd-main'
  },
  CI: {
    label: 'Builds',
    icon: 'ci-main'
  },
  CF: {
    label: 'Feature Flags',
    icon: 'cf-main'
  },
  CE: {
    label: 'Cloud Costs',
    icon: 'ce-main'
  },
  CV: {
    label: 'Service Reliability',
    icon: 'cv-main'
  },
  STO: {
    label: 'Security Tests',
    icon: 'sto-color-filled'
  },
  CHAOS: {
    label: 'Chaos Engineering',
    icon: 'chaos-main'
  },
  DX: undefined,
  COMMON: undefined,
  FRAMEWORK: undefined,
  TEMPLATES: undefined
}

export const getModuleInfo = (module: ModuleName): ModuleInfo | undefined => moduleConfig[module]
