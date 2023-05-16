/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useFeatures } from '@common/hooks/useFeatures'
import type { CheckFeaturesReturn } from 'framework/featureStore/featureStoreUtil'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import FeatureWarningCommonBanner from '@common/components/FeatureWarning/FeatureWarningCommonBanner'
import type {
  DisplayBanner} from '@common/components/FeatureWarning/FeatureWarningCommonBannerUtils';
import {
  FeatureWarningTheme,
  RedirectButton,
  getDismissBannerKey
} from '@common/components/FeatureWarning/FeatureWarningCommonBannerUtils'
import { useStrings } from 'framework/strings'
import type {
  ModuleToFeatureMapValue
} from './FeatureRestrictionBannersFactoryUtils';
import {
  getBannerDependencyMet,
  getQualifiedEnforcedBanner
} from './FeatureRestrictionBannersFactoryUtils'

// If multiple limits within a FeatureIdentifier, show higher limit first in the array
const ModuleToFeatureMap: Record<string, Record<string, ModuleToFeatureMapValue[]>> = {
  cd: {
    SERVICES: [
      {
        limit: 5,
        bannerKey: getDismissBannerKey({ featureIdentifier: FeatureIdentifier.SERVICES, limit: 5 }),
        limitCrossedMessage: 'pipeline.featureRestriction.serviceLimitExceeded',
        theme: FeatureWarningTheme.UPGRADE_REQUIRED
      }
    ]
  },
  ci: {
    MAX_TOTAL_BUILDS: [
      {
        limit: 2250,
        bannerKey: getDismissBannerKey({ featureIdentifier: FeatureIdentifier.MAX_TOTAL_BUILDS, limit: 2250 }),
        limitCrossedMessage: 'pipeline.featureRestriction.maxTotalBuilds90PercentLimit',
        theme: FeatureWarningTheme.INFO,
        redirectButtons: [RedirectButton.VIEW_USAGE_LINK, RedirectButton.EXPLORE_PLANS]
      }
    ],
    MAX_BUILDS_PER_MONTH: [
      {
        limit: 100,
        bannerKey: getDismissBannerKey({ featureIdentifier: FeatureIdentifier.MAX_BUILDS_PER_MONTH, limit: 100 }),
        limitCrossedMessage: 'pipeline.featureRestriction.maxBuildsPerMonth100PercentLimit',
        theme: FeatureWarningTheme.UPGRADE_REQUIRED,
        redirectButtons: [RedirectButton.VIEW_USAGE_LINK, RedirectButton.EXPLORE_PLANS],
        dependency: {
          MAX_TOTAL_BUILDS: { enabled: false }
        }
      },
      {
        limit: 0,
        bannerKey: getDismissBannerKey({ featureIdentifier: FeatureIdentifier.MAX_BUILDS_PER_MONTH, limit: 0 }),
        limitCrossedMessage: 'pipeline.featureRestriction.numMonthlyBuilds',
        theme: FeatureWarningTheme.INFO,
        redirectButtons: [RedirectButton.VIEW_USAGE_LINK, RedirectButton.EXPLORE_PLANS],
        dependency: {
          MAX_TOTAL_BUILDS: { enabled: false }
        }
      }
    ],
    ACTIVE_COMMITTERS: [
      {
        limitPercent: 100,
        bannerKey: getDismissBannerKey({ featureIdentifier: FeatureIdentifier.ACTIVE_COMMITTERS, limitPercent: 100 }),
        limitCrossedMessage: 'pipeline.featureRestriction.subscriptionExceededLimit',
        theme: FeatureWarningTheme.OVERUSE,
        redirectButtons: [RedirectButton.MANAGE_SUBSCRIPTION],
        dependency: {
          MAX_TOTAL_BUILDS: { enabled: true },
          MAX_BUILDS_PER_MONTH: { enabled: true }
        }
      },
      {
        limitPercent: 90,
        bannerKey: getDismissBannerKey({ featureIdentifier: FeatureIdentifier.ACTIVE_COMMITTERS, limitPercent: 90 }),
        limitCrossedMessage: 'pipeline.featureRestriction.subscription90PercentLimit',
        theme: FeatureWarningTheme.INFO,
        redirectButtons: [RedirectButton.MANAGE_SUBSCRIPTION],
        dependency: {
          MAX_TOTAL_BUILDS: { enabled: true },
          MAX_BUILDS_PER_MONTH: { enabled: true }
        }
      }
    ]
  },
  cf: {},
  cv: {},
  ce: {}
}

const getFeatureRestrictionDetailsForModule = (
  module: Module,
  featureIdentifier: FeatureIdentifier
): ModuleToFeatureMapValue[] | undefined => {
  // return the above map value for the supplied module 'key'
  const fromMap = ModuleToFeatureMap[module]
  return fromMap && fromMap[featureIdentifier]
}

interface FeatureRestrictionBannersProps {
  module: Module
  featureNames?: FeatureIdentifier[] // order will determine which banner will appear
  getCustomMessageString?: (features: CheckFeaturesReturn) => string
}

// Show this banner if limit usage is breached for the feature
export function FeatureRestrictionBanners(props: FeatureRestrictionBannersProps): JSX.Element | null {
  const { getString } = useStrings()
  const { module, featureNames = [] } = props
  const banners: DisplayBanner[] = []
  const { features } = useFeatures({ featuresRequest: { featureNames } })

  // only 1 banner will be shown for this module
  featureNames.some(featureName => {
    // Get the above map details
    const featureRestrictionModuleDetails = getFeatureRestrictionDetailsForModule(module, featureName)
    const { featureDetail } = features.get(featureName) || {}
    // check for the first message that would appear
    return featureRestrictionModuleDetails?.some((uiDisplayBanner: ModuleToFeatureMapValue) => {
      let bannerAdded = false
      if (
        featureDetail?.enabled === false &&
        featureDetail?.moduleType === module.toUpperCase() &&
        uiDisplayBanner.theme === FeatureWarningTheme.UPGRADE_REQUIRED
      ) {
        // when feature is not allowed (typically free account) and upgrade banner should be shown
        // moduleType necessary since sometimes enabled===false and no moduleType exists
        const dependency = uiDisplayBanner?.dependency
        const dependencyMet = getBannerDependencyMet({ features, featureName, dependency })
        const messageString = uiDisplayBanner?.limitCrossedMessage && getString(uiDisplayBanner.limitCrossedMessage)
        if (dependencyMet && messageString) {
          banners.push({
            featureName,
            isFeatureRestrictionAllowedForModule: featureDetail.enabled,
            theme: uiDisplayBanner.theme,
            redirectButtons: uiDisplayBanner.redirectButtons,
            bannerKey: uiDisplayBanner.bannerKey,
            messageString
          })
          bannerAdded = true
        }
      } else if (featureDetail?.enabled) {
        /*
          Show the banner if
          1. Feature enforcement enabled
          2. If dependency exists and matches
          
          getQualifiedEnforcedBanner
          3. Usage limit | percent uiDisplayBanner is breached
          4. Message is present in the above map value
        */
        const dependency = uiDisplayBanner?.dependency
        const dependencyMet = getBannerDependencyMet({ features, dependency })
        const addBanner = getQualifiedEnforcedBanner({
          dependencyMet,
          featureDetail,
          uiDisplayBanner,
          getString,
          featureName
        })
        if (addBanner) {
          banners.push(addBanner)
          bannerAdded = true
        }
      }
      return bannerAdded
    })
  })
  // Awaiting PM/UX for multiple banners or aggregated single banner
  if (banners.length) {
    return (
      <>
        {banners.map(banner => (
          <FeatureWarningCommonBanner key={banner.messageString} banner={banner} />
        ))}
      </>
    )
  }
  return null
}
