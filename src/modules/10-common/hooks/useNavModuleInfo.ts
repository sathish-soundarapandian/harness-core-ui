import { useParams } from 'react-router-dom'
import type { IconName } from '@harness/icons'
import type { StringKeys } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

export type NavModuleName =
  | ModuleName.CD
  | ModuleName.CI
  | ModuleName.CV
  | ModuleName.CF
  | ModuleName.CE
  | ModuleName.CHAOS
  | ModuleName.STO

interface usetNavModuleInfoReturnType {
  shouldVisible: boolean
  label: StringKeys
  icon: IconName
  redirectionLink: string
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
  }
}

const useNavModuleInfo = (module: NavModuleName): usetNavModuleInfoReturnType => {
  const { accountId } = useParams<AccountPathProps>()

  const { icon, label, getRedirectLink, featureFlagName } = moduleInfoMap[module]
  return {
    icon,
    label,
    redirectionLink: getRedirectLink(accountId),
    shouldVisible: useFeatureFlag(featureFlagName)
  }
}

export default useNavModuleInfo
