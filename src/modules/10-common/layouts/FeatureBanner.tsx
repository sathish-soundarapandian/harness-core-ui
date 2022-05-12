/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Button, ButtonVariation, ButtonSize, Layout } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'

import featuresFactory from 'framework/featureStore/FeaturesFactory'
import type { FeatureProps } from 'framework/featureStore/FeaturesFactory'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import { isEnterprisePlan, isFreePlan, isTeamPlan, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { Module, ModuleName, moduleToModuleNameMapping } from 'framework/types/ModuleName'
import { useFeatures } from '@common/hooks/useFeatures'
import { useLocalStorage } from '@common/hooks/useLocalStorage'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, FeatureActions } from '@common/constants/TrackingConstants'
import {
  ViewUsageLink,
  ExplorePlansBtn,
  ManageSubscriptionBtn,
  InfoText,
  LevelUpText,
  OverUseInfoText
} from './FeatureUtils'
import { BannerType } from './Constants'
import css from './layouts.module.scss'

export const BANNER_KEY = 'feature_banner_dismissed'

export const isFeatureLimitBreached = (feature?: CheckFeatureReturn) => {
  const featureDetail = feature?.featureDetail
  return featureDetail?.limit && featureDetail.count && featureDetail.count === featureDetail.limit
}

export const isFeatureLimitBreachedIncludesExceeding = (feature?: CheckFeatureReturn): boolean => {
  const featureDetail = feature?.featureDetail
  return !!(featureDetail?.limit && featureDetail.count && featureDetail.count >= featureDetail.limit)
}

export const FEATURE_USAGE_WARNING_LIMIT = 90

export const isFeatureWarningActive = (feature?: CheckFeatureReturn) => {
  const featureDetail = feature?.featureDetail
  return (
    featureDetail?.limit &&
    featureDetail.count &&
    featureDetail.count > (featureDetail.limit * FEATURE_USAGE_WARNING_LIMIT) / 100 &&
    featureDetail.count < featureDetail.limit
  )
}

export const isFeatureWarningActiveIncludesLimit = (feature?: CheckFeatureReturn): boolean => {
  const featureDetail = feature?.featureDetail
  return !!(
    featureDetail?.limit &&
    featureDetail.count &&
    featureDetail.count > (featureDetail.limit * FEATURE_USAGE_WARNING_LIMIT) / 100
  )
}

export const isFeatureCountActive = (feature?: CheckFeatureReturn) => {
  const featureDetail = feature?.featureDetail
  return featureDetail?.limit && typeof featureDetail.count !== 'undefined'
}

export const isFeatureOveruseActive = (feature?: CheckFeatureReturn) => {
  const featureDetail = feature?.featureDetail
  return featureDetail?.limit && featureDetail.count && featureDetail.count > featureDetail.limit
}

export const isFeatureLimitMet = (feature?: CheckFeatureReturn) => {
  const featureDetail = feature?.featureDetail
  return featureDetail?.limit && featureDetail.count && featureDetail.count >= featureDetail.limit
}

export const getActiveUsageNumber = (feature?: CheckFeatureReturn) => {
  const featureDetail = feature?.featureDetail
  return featureDetail?.limit && featureDetail.count && Math.floor((featureDetail.count * 100) / featureDetail.limit)
}

export const getPercentageNumber = (feature?: CheckFeatureReturn) => {
  const featureDetail = feature?.featureDetail

  return (
    featureDetail?.limit &&
    featureDetail.count &&
    Math.min(Math.floor((featureDetail.count / featureDetail.limit) * 100), 100)
  )
}

function getBannerClassNameByType(type: BannerType): string {
  switch (type) {
    case BannerType.INFO:
      return css.info
    case BannerType.LEVEL_UP:
      return css.levelUp
    case BannerType.OVERUSE:
      return css.overUse
    default:
      return ''
  }
}
function getBannerBodyByType({
  type,
  message,
  module,
  isFreeEdition
}: {
  type: BannerType
  message: React.ReactNode
  module: Module
  isFreeEdition: boolean
}): React.ReactElement {
  const buttons = isFreeEdition ? (
    <>
      <ViewUsageLink module={module} />
      <ExplorePlansBtn module={module} />
    </>
  ) : (
    <ManageSubscriptionBtn module={module} />
  )

  function getText(): React.ReactElement {
    switch (type) {
      case BannerType.INFO:
        return <InfoText message={message} />
      case BannerType.LEVEL_UP:
        return <LevelUpText message={message} />
      case BannerType.OVERUSE:
        return <OverUseInfoText message={message} />
      default:
        return <></>
    }
  }

  return (
    <Layout.Horizontal width="95%" padding={{ left: 'large' }} style={{ minWidth: '800px' }}>
      {getText()}
      {buttons}
    </Layout.Horizontal>
  )
}

export default function FeatureBanner(): React.ReactElement | null {
  const { module } = useModuleInfo()
  const { getString } = useStrings()

  const { FEATURE_ENFORCEMENT_ENABLED: isFeatureEnforceEnabled, FREE_PLAN_ENFORCEMENT_ENABLED } = useFeatureFlags()
  const [activeModuleFeatures, setActiveModuleFeatures] = React.useState<FeatureProps | null>(null)
  const [isBannerDismissed, setIsBannerDismissed] = useLocalStorage<Partial<Record<Module, boolean>>>(
    BANNER_KEY,
    {},
    window.sessionStorage
  )
  const features = useFeatures({ featuresRequest: { featureNames: defaultTo(activeModuleFeatures?.features, []) } })

  const moduleName: ModuleName = module ? moduleToModuleNameMapping[module] : ModuleName.COMMON
  const usageAndLimitInfo = useGetUsageAndLimit(moduleName)

  const { licenseInformation } = useLicenseStore()
  const isFreeEdition = isFreePlan(licenseInformation, moduleName)
  const isTeamEdition = isTeamPlan(licenseInformation, moduleName)
  const isEnterpriseEdition = isEnterprisePlan(licenseInformation, moduleName)
  const additionalLicenseProps = useMemo(() => {
    return {
      isFreeEdition,
      isTeamEdition,
      isEnterpriseEdition
    }
  }, [isFreeEdition, isTeamEdition, isEnterpriseEdition])
  const shouldDisplayForFreePlanOnly = FREE_PLAN_ENFORCEMENT_ENABLED && (isTeamEdition || isEnterpriseEdition)

  React.useEffect(() => {
    if (module) {
      const moduleFeatures = featuresFactory.getFeaturesByModule(module)
      setActiveModuleFeatures(moduleFeatures || null)
    }
  }, [module])

  const { message: messageFn, bannerType } =
    activeModuleFeatures?.renderMessage(features, getString, additionalLicenseProps, usageAndLimitInfo) || {}

  const message = messageFn?.()

  const { trackEvent } = useTelemetry()

  if (
    !isFeatureEnforceEnabled ||
    shouldDisplayForFreePlanOnly ||
    !message ||
    !bannerType ||
    !module ||
    isBannerDismissed[module]
  ) {
    return null
  }

  return (
    <div className={cx(css.featuresBanner, getBannerClassNameByType(bannerType))}>
      {getBannerBodyByType({ type: bannerType, message, module, isFreeEdition })}
      <Button
        variation={ButtonVariation.ICON}
        size={ButtonSize.LARGE}
        icon="cross"
        data-testid="feature-banner-dismiss"
        onClick={() => {
          trackEvent(FeatureActions.DismissFeatureBanner, {
            category: Category.ENFORCEMENT
          })
          setIsBannerDismissed(prev => (module ? { ...prev, [module]: true } : prev))
        }}
      />
    </div>
  )
}
