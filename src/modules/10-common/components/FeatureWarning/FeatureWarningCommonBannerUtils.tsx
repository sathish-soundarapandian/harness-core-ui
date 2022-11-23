/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/uicore'
import type { UseStringsReturn } from 'framework/strings'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import {
  ManageSubscriptionBtn,
  ExplorePlansBtn,
  RequestUpgradeBtn,
  ViewUsageLink,
  ViewUsageBtn,
  ExploreSaasPlansBtn
} from './featureWarningUtil'
import css from './FeatureWarningCommonBanner.module.scss'

const infoMessageIconName = 'info-message'

export enum FeatureWarningTheme {
  INFO = 'INFO', // white bg, info icon
  UPGRADE_REQUIRED = 'UPGRADE_REQUIRED', // orange bg, bolt icon, headline
  OVERUSE = 'OVERUSE', // yellow bg, warning icon, headline
  KEEP_GETTING_SHIP_DONE = 'KEEP_GETTING_SHIP_DONE', // blue bg, info icon, headline
  UPSELL = 'UPSELL', // white bg, stars icon
  CUSTOM = 'CUSTOM' // enter props in customBannerProps
}

export enum RedirectButton {
  VIEW_USAGE_LINK = 'VIEW_USAGE_LINK',
  VIEW_USAGE_BUTTON = 'VIEW_USAGE_BUTTON',
  EXPLORE_PLANS = 'EXPLORE_PLANS',
  EXPLORE_SAAS_PLANS = 'EXPLORE_SAAS_PLANS',
  MANAGE_SUBSCRIPTION = 'MANAGE_SUBSCRIPTION',
  REQUEST_UPGRADE = 'REQUEST_UPGRADE'
}

export const DEFAULT_ICON_SIZE = 20

export interface DisplayBanner {
  featureName: FeatureIdentifier
  bannerKey: string
  allowed?: boolean
  messageString: string
  theme: FeatureWarningTheme
  redirectButtons?: RedirectButton[]
  isFeatureRestrictionAllowedForModule?: boolean
}

interface IconProps {
  iconName?: IconName
  iconSize?: number
}
export interface CustomBannerProps {
  iconProps?: IconProps
  headline?: string
  buttons?: JSX.Element
  className?: string
}

export const getBackgroundColor = ({
  theme,
  className
}: {
  theme: FeatureWarningTheme
  className?: string
}): string => {
  if (className) {
    return className
  }

  switch (theme) {
    case FeatureWarningTheme.UPGRADE_REQUIRED:
      return css.upgradeRequiredBanner
    case FeatureWarningTheme.INFO:
      return css.infoBanner
    case FeatureWarningTheme.OVERUSE:
      return css.overuseBanner
    case FeatureWarningTheme.UPSELL:
      return css.upsellBanner
    case FeatureWarningTheme.KEEP_GETTING_SHIP_DONE:
      return css.keepGettingShipDoneBanner
    default:
      return ''
  }
}

export const getIconDetails = ({
  theme,
  iconProps
}: {
  theme: FeatureWarningTheme
  iconProps?: IconProps
}): { iconName: IconName; iconSize: number } => {
  if (iconProps && Object.keys(iconProps).length > 0) {
    return { iconName: iconProps.iconName || infoMessageIconName, iconSize: iconProps?.iconSize || DEFAULT_ICON_SIZE }
  }

  switch (theme) {
    case FeatureWarningTheme.UPGRADE_REQUIRED:
      return { iconName: 'upgrade-bolt', iconSize: iconProps?.iconSize || DEFAULT_ICON_SIZE }
    case FeatureWarningTheme.INFO:
    case FeatureWarningTheme.KEEP_GETTING_SHIP_DONE:
      return { iconName: infoMessageIconName, iconSize: iconProps?.iconSize || DEFAULT_ICON_SIZE }
    case FeatureWarningTheme.OVERUSE:
      return { iconName: 'warning-sign', iconSize: iconProps?.iconSize || DEFAULT_ICON_SIZE }
    case FeatureWarningTheme.UPSELL:
      return { iconName: 'stars', iconSize: iconProps?.iconSize || DEFAULT_ICON_SIZE }
    default:
      return { iconName: infoMessageIconName, iconSize: iconProps?.iconSize || DEFAULT_ICON_SIZE }
  }
}

export const getHeadline = ({
  theme,
  headline,
  getString
}: {
  theme: FeatureWarningTheme
  headline?: string
  getString: UseStringsReturn['getString']
}): string => {
  if (headline) {
    return headline
  }

  switch (theme) {
    case FeatureWarningTheme.UPGRADE_REQUIRED:
      return getString('common.levelUp').toUpperCase()
    case FeatureWarningTheme.OVERUSE:
      return getString('common.feature.overuse.title').toUpperCase()

    case FeatureWarningTheme.KEEP_GETTING_SHIP_DONE:
      return getString('common.feature.keepGettingShipDone.title').toUpperCase()
    default:
      return ''
  }
}

export const renderRedirectButton = ({
  type,
  featureName
}: {
  type: RedirectButton
  featureName: FeatureIdentifier
}): JSX.Element | null => {
  switch (type) {
    case RedirectButton.VIEW_USAGE_LINK:
      return <ViewUsageLink featureName={featureName} />
    case RedirectButton.VIEW_USAGE_BUTTON:
      return <ViewUsageBtn featureName={featureName} />
    case RedirectButton.MANAGE_SUBSCRIPTION:
      return <ManageSubscriptionBtn featureName={featureName} />
    case RedirectButton.EXPLORE_PLANS:
      return <ExplorePlansBtn featureName={featureName} />
    case RedirectButton.EXPLORE_SAAS_PLANS:
      return <ExploreSaasPlansBtn />
    case RedirectButton.REQUEST_UPGRADE:
      return <RequestUpgradeBtn featureName={featureName} />

    default:
      return null
  }
}

export const getDismissBannerKey = ({
  featureIdentifier,
  limit,
  limitPercent
}: {
  featureIdentifier: FeatureIdentifier
  limit?: number
  limitPercent?: number
}): string => {
  const thresholdIdentifier = typeof limit === 'number' ? limit : typeof limitPercent === 'number' ? limitPercent : 0
  return `${featureIdentifier}_${thresholdIdentifier}`
}
