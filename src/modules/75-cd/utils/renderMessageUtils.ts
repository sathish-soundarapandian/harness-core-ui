/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { BannerType } from '@common/layouts/Constants'
import {
  getActiveUsageNumber,
  isFeatureLimitBreached,
  isFeatureOveruseActive,
  isFeatureWarningActive
} from '@common/layouts/FeatureBanner'
import type { RenderMessageReturn } from 'framework/featureStore/FeaturesFactory'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import type { UseStringsReturn } from 'framework/strings'

export const getBannerText = (
  getString: UseStringsReturn['getString'],
  additionalLicenseProps: Record<string, unknown>,
  serviceFeatureDetail?: CheckFeatureReturn,
  dpmFeatureDetail?: CheckFeatureReturn,
  initialDeploymentsFeatureDetail?: CheckFeatureReturn
): RenderMessageReturn => {
  const { isFreeEdition: isCDFree, isTeamEdition: isCDTeam } = additionalLicenseProps
  // Check for limit breach
  const isServiceLimitBreached = isFeatureLimitBreached(serviceFeatureDetail)
  const isDpmLimitBreached = isFeatureLimitBreached(dpmFeatureDetail)
  let limitBreachMessageString = ''

  if (isServiceLimitBreached && isDpmLimitBreached) {
    limitBreachMessageString = getString('cd.featureRestriction.banners.serviceAndDeploymentsLevelUp', {
      deploymentsLimit: dpmFeatureDetail?.featureDetail?.limit,
      serviceLimit: serviceFeatureDetail?.featureDetail?.limit
    })
  } else if (isServiceLimitBreached && isCDFree) {
    limitBreachMessageString = getString('cd.featureRestriction.banners.serviceLevelUp', {
      serviceLimit: serviceFeatureDetail?.featureDetail?.limit
    })
  } else if (isServiceLimitBreached && isCDTeam) {
    limitBreachMessageString = getString('cd.featureRestriction.banners.serviceLevelUpTeamEnterprise', {
      serviceLimit: serviceFeatureDetail?.featureDetail?.limit
    })
  } else if (isDpmLimitBreached) {
    limitBreachMessageString = getString('cd.featureRestriction.banners.deploymentsPerMonthLevelUp', {
      count: dpmFeatureDetail?.featureDetail?.count,
      deploymentsLimit: dpmFeatureDetail?.featureDetail?.limit
    })
  }

  if (limitBreachMessageString) {
    return {
      message: () => limitBreachMessageString,
      bannerType: BannerType.LEVEL_UP
    }
  }

  // Checking for limit usage warning
  let warningMessageString = ''
  const isServiceWarningActive = isFeatureWarningActive(serviceFeatureDetail)
  const isDpmWarningActive = isFeatureWarningActive(dpmFeatureDetail)
  const isInitialDeplWarningActive = isFeatureWarningActive(initialDeploymentsFeatureDetail)
  if (isInitialDeplWarningActive) {
    warningMessageString = getString('cd.featureRestriction.banners.initialDeploymentsWarningActive', {
      warningLimit: getActiveUsageNumber(initialDeploymentsFeatureDetail)
    })
  } else if (isServiceWarningActive) {
    warningMessageString = getString('cd.featureRestriction.banners.serviceWarningActive', {
      warningLimit: getActiveUsageNumber(serviceFeatureDetail)
    })
  } else if (isDpmWarningActive) {
    warningMessageString = getString('cd.featureRestriction.banners.dpmWarningActive', {
      count: dpmFeatureDetail?.featureDetail?.count,
      warningLimit: dpmFeatureDetail?.featureDetail?.limit
    })
  }

  if (warningMessageString) {
    return {
      message: () => warningMessageString,
      bannerType: BannerType.INFO
    }
  }

  let overuseMessageString = ''
  const isServiceOveruseActive = isFeatureOveruseActive(serviceFeatureDetail)
  if (isServiceOveruseActive && isCDTeam) {
    overuseMessageString = getString('cd.featureRestriction.banners.serviceOveruseTeamEnterprise')
  }
  if (overuseMessageString) {
    return {
      message: () => overuseMessageString,
      bannerType: BannerType.OVERUSE
    }
  }

  // If neither of limit breach/ warning/ overuse needs to be shown, return with an empty string.
  // This will ensure no banner is shown
  return {
    message: () => '',
    bannerType: BannerType.LEVEL_UP
  }
}
