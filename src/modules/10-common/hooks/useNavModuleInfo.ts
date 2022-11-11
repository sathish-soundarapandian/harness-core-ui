/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import type { IconName } from '@harness/icons'
import type { StringKeys } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'

export type NavModuleName =
  | ModuleName.CD
  | ModuleName.CI
  | ModuleName.CV
  | ModuleName.CF
  | ModuleName.CE
  | ModuleName.CHAOS
  | ModuleName.STO
  | ModuleName.SCM
  | ModuleName.IAC

export const DEFAULT_MODULES_ORDER: NavModuleName[] = [
  ModuleName.CD,
  ModuleName.CI,
  ModuleName.CF,
  ModuleName.CE,
  ModuleName.CV,
  ModuleName.SCM,
  ModuleName.STO,
  ModuleName.CHAOS,
  ModuleName.IAC
]

interface useNavModuleInfoReturnType {
  shouldVisible: boolean
  label: StringKeys
  icon: IconName
  homePageUrl: string
  hasLicense?: boolean
  color: string
}

interface ModuleInfo {
  icon: IconName
  label: StringKeys
  getHomePageUrl: (accountId: string) => string
  featureFlagName: FeatureFlag
  color: string
}

const moduleInfoMap: Record<NavModuleName, ModuleInfo> = {
  [ModuleName.CD]: {
    icon: 'cd-main',
    label: 'common.cdAndGitops',
    getHomePageUrl: (accountId: string) => routes.toCD({ accountId }),
    featureFlagName: FeatureFlag.CDNG_ENABLED,
    color: '--cd-border'
  },
  [ModuleName.CI]: {
    icon: 'ci-main',
    label: 'common.purpose.ci.continuous',
    getHomePageUrl: (accountId: string) => routes.toCI({ accountId }),
    featureFlagName: FeatureFlag.CING_ENABLED,
    color: '--ci-border'
  },
  [ModuleName.CV]: {
    icon: 'cv-main',
    label: 'common.serviceReliabilityManagement',
    getHomePageUrl: (accountId: string) => routes.toCV({ accountId }),
    featureFlagName: FeatureFlag.CVNG_ENABLED,
    color: '--srm-border'
  },
  [ModuleName.CF]: {
    icon: 'ff-solid',
    label: 'common.purpose.cf.continuous',
    getHomePageUrl: (accountId: string) => routes.toCF({ accountId }),
    featureFlagName: FeatureFlag.CFNG_ENABLED,
    color: '--ff-border'
  },
  [ModuleName.CE]: {
    icon: 'ce-main',
    label: 'common.purpose.ce.continuous',
    getHomePageUrl: (accountId: string) => routes.toCE({ accountId }),
    featureFlagName: FeatureFlag.CENG_ENABLED,
    color: '--ccm-border'
  },
  [ModuleName.STO]: {
    icon: 'sto-color-filled',
    label: 'common.stoText',
    getHomePageUrl: (accountId: string) => routes.toSTO({ accountId }),
    featureFlagName: FeatureFlag.SECURITY,
    color: '--sto-border'
  },
  [ModuleName.CHAOS]: {
    icon: 'chaos-main',
    label: 'chaos.homepage.chaosHomePageTitle',
    getHomePageUrl: (accountId: string) => routes.toChaos({ accountId }),
    featureFlagName: FeatureFlag.CHAOS_ENABLED,
    color: '--chaos-border'
  },
  [ModuleName.SCM]: {
    icon: 'gitops-green',
    label: 'common.purpose.scm.name',
    getHomePageUrl: (accountId: string) => routes.toSCM({ accountId }),
    featureFlagName: FeatureFlag.SCM_ENABLED,
    color: '--default-module-border'
  },
  [ModuleName.IAC]: {
    icon: 'sto-color-filled',
    label: 'iac.iacmTitle',
    getHomePageUrl: (accountId: string) => routes.toIac({ accountId }),
    featureFlagName: FeatureFlag.IACM_ENABLED,
    color: '--iac-border'
  }
}

export interface GroupConfig {
  label: StringKeys
  items: NavModuleName[]
}

// Grouping of modules with label
export const moduleGroupConfig: GroupConfig[] = [
  {
    label: 'common.moduleList.buildAndTest',
    items: [ModuleName.CI, ModuleName.CHAOS, ModuleName.STO, ModuleName.IAC]
  },
  {
    label: 'common.moduleList.deployChanges',
    items: [ModuleName.CD, ModuleName.CF]
  },
  {
    label: 'common.moduleList.manageImpact',
    items: [ModuleName.CE, ModuleName.CV]
  }
]

const getModuleInfo = (
  moduleInfo: ModuleInfo,
  accountId: string,
  hasLicense: boolean,
  shouldVisible: boolean,
  color: string
) => {
  const { icon: moduleIcon, label, getHomePageUrl } = moduleInfo
  return {
    icon: moduleIcon,
    label,
    homePageUrl: getHomePageUrl(accountId),
    shouldVisible: shouldVisible,
    hasLicense,
    color
  }
}

const useNavModuleInfo = (module: NavModuleName) => {
  const { accountId } = useParams<AccountPathProps>()
  const featureFlags = useFeatureFlags()
  const { licenseInformation } = useLicenseStore()

  const { featureFlagName, color } = moduleInfoMap[module]

  return getModuleInfo(
    moduleInfoMap[module],
    accountId,
    !!licenseInformation[module]?.id,
    !!featureFlags[featureFlagName],
    color
  ) as useNavModuleInfoReturnType
}

export const useNavModuleInfoMap = (): Record<NavModuleName, useNavModuleInfoReturnType> => {
  const { accountId } = useParams<AccountPathProps>()
  const featureFlags = useFeatureFlags()

  const { licenseInformation } = useLicenseStore()

  const modules = Object.keys(moduleInfoMap) as NavModuleName[]

  const infoMap = modules.reduce((map, module) => {
    return {
      ...map,
      [module]: getModuleInfo(
        moduleInfoMap[module],
        accountId,
        !!licenseInformation[module]?.id,
        !!featureFlags[moduleInfoMap[module].featureFlagName],
        moduleInfoMap[module].color
      )
    }
  }, {})

  // eslint-disable-next-line
  // @ts-ignore
  return infoMap as Record<NavModuleName, useNavModuleInfoReturnType>
}

export default useNavModuleInfo
