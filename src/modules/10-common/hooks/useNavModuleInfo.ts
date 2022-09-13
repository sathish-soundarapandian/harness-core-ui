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
import type { ModuleLicenseDTO } from 'services/cd-ng'
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

export const DEFAULT_MODULES_ORDER: NavModuleName[] = [
  ModuleName.CD,
  ModuleName.CI,
  ModuleName.CF,
  ModuleName.CE,
  ModuleName.CV,
  ModuleName.STO,
  ModuleName.CHAOS
]

interface useNavModuleInfoReturnType {
  name: NavModuleName
  shouldVisible: boolean
  label: StringKeys
  icon: IconName
  redirectionLink: string
  licenseType?: ModuleLicenseDTO['licenseType']
}

interface ModuleInfo {
  icon: IconName
  label: StringKeys
  getRedirectLink: (accountId: string) => string
  featureFlagName: FeatureFlag
}

const moduleInfoMap: Record<NavModuleName, ModuleInfo> = {
  [ModuleName.CD]: {
    icon: 'cd-main',
    label: 'common.purpose.cd.continuous',
    getRedirectLink: (accountId: string) => routes.toCD({ accountId }),
    featureFlagName: FeatureFlag.CDNG_ENABLED
  },
  [ModuleName.CI]: {
    icon: 'ci-main',
    label: 'common.purpose.ci.continuous',
    getRedirectLink: (accountId: string) => routes.toCI({ accountId }),
    featureFlagName: FeatureFlag.CING_ENABLED
  },
  [ModuleName.CV]: {
    icon: 'cv-main',
    label: 'common.purpose.cv.serviceReliability',
    getRedirectLink: (accountId: string) => routes.toCV({ accountId }),
    featureFlagName: FeatureFlag.CVNG_ENABLED
  },
  [ModuleName.CF]: {
    icon: 'ff-solid',
    label: 'common.purpose.cf.continuous',
    getRedirectLink: (accountId: string) => routes.toCF({ accountId }),
    featureFlagName: FeatureFlag.CFNG_ENABLED
  },
  [ModuleName.CE]: {
    icon: 'ce-main',
    label: 'common.purpose.ce.cloudCost',
    getRedirectLink: (accountId: string) => routes.toCE({ accountId }),
    featureFlagName: FeatureFlag.CENG_ENABLED
  },
  [ModuleName.STO]: {
    icon: 'sto-color-filled',
    label: 'common.purpose.sto.continuous',
    getRedirectLink: (accountId: string) => routes.toSTO({ accountId }),
    featureFlagName: FeatureFlag.SECURITY
  },
  [ModuleName.CHAOS]: {
    icon: 'chaos-main',
    label: 'common.chaosText',
    getRedirectLink: (accountId: string) => routes.toChaos({ accountId }),
    featureFlagName: FeatureFlag.CHAOS_ENABLED
  },
  [ModuleName.SCM]: {
    icon: 'gitops-green',
    label: 'common.purpose.scm.name',
    getRedirectLink: (accountId: string) => routes.toSCM({ accountId }),
    featureFlagName: FeatureFlag.SCM_ENABLED
  }
}

const useNavModuleInfo = (modules: NavModuleName[]): useNavModuleInfoReturnType[] => {
  const { accountId } = useParams<AccountPathProps>()
  const featureFlags = useFeatureFlags()
  const { licenseInformation } = useLicenseStore()

  return modules.map(module => {
    const { icon, label, getRedirectLink, featureFlagName } = moduleInfoMap[module]
    return {
      name: module,
      icon,
      label,
      redirectionLink: getRedirectLink(accountId),
      shouldVisible: featureFlags[featureFlagName] || false,
      licenseType: licenseInformation[module]?.licenseType
    }
  })
}

export const useNavModuleInfoMap = (): Record<NavModuleName, useNavModuleInfoReturnType> => {
  const modules = Object.keys(moduleInfoMap) as NavModuleName[]
  const modulesInfo = useNavModuleInfo(modules)

  const infoMap = modulesInfo.reduce((map, moduleInfo, index) => {
    return {
      ...map,
      [modules[index]]: moduleInfo
    }
  }, {})

  // eslint-disable-next-line
  // @ts-ignore
  return infoMap as Record<NavModuleName, useNavModuleInfoReturnType>
}

export default useNavModuleInfo
