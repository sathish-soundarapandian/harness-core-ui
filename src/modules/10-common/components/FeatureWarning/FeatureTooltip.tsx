/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Layout, Text, ButtonVariation } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { capitalize } from 'lodash-es'
import type { IconName } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { FeatureDescriptor, customFeatureDescriptor } from 'framework/featureStore/FeatureDescriptor'
import { useFeatureRequiredPlans } from '@common/hooks/useFeatures'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { StringsMap } from 'stringTypes'
import type { ModuleName, Module } from 'framework/types/ModuleName'
import type { CheckFeatureReturn, ModuleType } from 'framework/featureStore/featureStoreUtil'
import { isFreePlan, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ExplorePlansBtn, ManageSubscriptionBtn, ViewUsageLink } from '@common/layouts/FeatureUtils'
import { useFeaturesContext } from 'framework/featureStore/FeaturesContext'
import { Editions } from '@common/constants/SubscriptionTypes'
import css from './FeatureWarning.module.scss'

interface FeatureTooltipProps {
  features: Map<FeatureIdentifier, CheckFeatureReturn>
  warningMessage?: React.ReactNode
}

const FeatureText = ({ feature, module }: { feature: CheckFeatureReturn; module: ModuleType }): React.ReactElement => {
  const { getString } = useStrings()
  const { count, featureName } = feature.featureDetail || {}
  const requiredPlans = useFeatureRequiredPlans(featureName)
  if (featureName) {
    const featureNameStr = capitalize(featureName.split('_').join(' '))
    const customFeatureDescription = customFeatureDescriptor(featureName, getString, { limits: count })
    const featureDescription = FeatureDescriptor[featureName] ? FeatureDescriptor[featureName] : featureNameStr
    const isCore = module === 'CORE'
    const limitDescription = (
      <Text padding={{ bottom: 'small', left: 'large' }} color={Color.WHITE}>
        {`${getString('common.feature.levelUp.limitMessage.description' as keyof StringsMap, {
          limits: count
        })} `}
        {featureDescription}
        {` ${getString('common.feature.levelUp.limitMessage.thisMonth').toLowerCase()}.`}
      </Text>
    )
    if (!isCore && count) {
      return customFeatureDescription ? (
        <Text padding={{ bottom: 'small', left: 'large' }} color={Color.WHITE}>
          {customFeatureDescription}
        </Text>
      ) : (
        limitDescription
      )
    }
    const requiredPlansStr =
      requiredPlans.length > 0
        ? requiredPlans.join(` ${getString('common.or').toLowerCase()} `)
        : getString('common.upgrade').toLowerCase()
    const upgradeDescription = ` ${getString('common.feature.levelUp.planMessage' as keyof StringsMap, {
      plan: requiredPlansStr
    })}`
    return (
      <Text padding={{ bottom: 'small' }} color={Color.WHITE}>
        {featureDescription}
        {upgradeDescription}
      </Text>
    )
  }
  return <></>
}

const ModuleButtons = ({ module, hasLimit }: { module: Module; hasLimit: boolean }): React.ReactElement => {
  const {
    licenseInformation,
    CD_LICENSE_STATE,
    CI_LICENSE_STATE,
    FF_LICENSE_STATE,
    CCM_LICENSE_STATE,
    CHAOS_LICENSE_STATE
  } = useLicenseStore()
  const moduleName = module.toUpperCase() as ModuleName
  const isModuleFeature = ['CI', 'CD', 'CE', 'CF', 'CV', 'CHAOS'].includes(moduleName)
  const isModuleFreeEdition = isModuleFeature && isFreePlan(licenseInformation, moduleName)

  const licenseStatus = {
    CD_LICENSE_STATE,
    CI_LICENSE_STATE,
    FF_LICENSE_STATE,
    CCM_LICENSE_STATE,
    CHAOS_LICENSE_STATE
  }

  const { getHighestEdition } = useFeaturesContext()

  if (isModuleFreeEdition) {
    return (
      <Layout.Vertical flex={{ alignItems: 'start' }} spacing={'xsmall'}>
        {hasLimit && <ViewUsageLink module={module} className={css.viewUsageLink} />}
        <ExplorePlansBtn module={module} variation={ButtonVariation.PRIMARY} />
      </Layout.Vertical>
    )
  }

  // for PL feature
  if (!isModuleFeature) {
    const accountPlan = getHighestEdition({ licenseInformation, licenseState: licenseStatus })
    const accountModule = [...Object.keys(licenseInformation)].find(
      key => licenseInformation[key]?.edition === accountPlan
    )
    const defaultModule = accountModule as Module

    return accountPlan === Editions.FREE ? (
      <ExplorePlansBtn module={defaultModule} variation={ButtonVariation.PRIMARY} />
    ) : (
      <ManageSubscriptionBtn module={defaultModule} variation={ButtonVariation.PRIMARY} />
    )
  }

  return <ManageSubscriptionBtn module={module} variation={ButtonVariation.PRIMARY} />
}

function DefaultButtons({ feature }: { feature?: CheckFeatureReturn }): React.ReactElement | null {
  const { moduleType = 'CORE' } = feature?.featureDetail || {}
  const module = moduleType.toLowerCase() as Module
  const hasLimit = feature?.featureDetail?.limit !== undefined

  if (!feature) {
    return null
  }

  return <ModuleButtons module={module} hasLimit={hasLimit} />
}

const FeatureTooltip = ({ features, warningMessage }: FeatureTooltipProps): ReactElement => {
  const { getString } = useStrings()
  const firstDisabledFeatureName = [...features.keys()].find(key => features.get(key)?.enabled === false)
  const firstDisabledFeature = firstDisabledFeatureName && features.get(firstDisabledFeatureName)

  function getGroupDisabledFeatures(): Map<ModuleType, CheckFeatureReturn[]> {
    return [...features.values()].reduce((group, feature) => {
      const module = feature.featureDetail?.moduleType
      const featureDisabled = !feature.enabled
      if (featureDisabled) {
        if (module && ['CD', 'CI', 'CE', 'CF', 'CHAOS'].includes(module)) {
          group.set(module, [...(group.get(module) || []), feature])
        } else {
          group.set('CORE', [...(group.get('CORE') || []), feature])
        }
      }
      return group
    }, new Map<ModuleType, CheckFeatureReturn[]>())
  }

  function GroupedTooltips(): React.ReactElement {
    const groupedDisabledFeatures = getGroupDisabledFeatures()

    function getHeader(module: ModuleType): React.ReactNode | undefined {
      let icon, id
      switch (module) {
        case 'CD':
          icon = 'cd-main'
          id = 'common.purpose.cd.continuous'
          break

        case 'CI':
          icon = 'ci-main'
          id = 'common.purpose.ci.continuous'
          break
        case 'CF':
          icon = 'cf-main'
          id = 'common.purpose.cf.continuous'
          break
        case 'CE':
          icon = 'ce-main'
          id = 'common.purpose.ce.continuous'
          break
        case 'CHAOS':
          icon = 'chaos-main'
          id = 'common.purpose.chaos.continuous'
          break
      }
      return (
        icon &&
        id && (
          <Text
            icon={icon as IconName}
            color={Color.WHITE}
            iconProps={{ color: Color.WHITE }}
            font={{ weight: 'semi-bold' }}
            padding={{ bottom: 'small' }}
          >
            {getString(id as keyof StringsMap)}
          </Text>
        )
      )
    }

    const haslimits =
      [...groupedDisabledFeatures.values()].find(value =>
        value.find(feature => feature.featureDetail?.limit !== undefined)
      ) !== undefined

    return (
      <Layout.Vertical spacing="large">
        {haslimits && (
          <Text color={Color.WHITE} padding={{ bottom: 'large' }} rightIcon="flag" className={css.flag}>
            {getString('common.feature.levelUp.description')}
          </Text>
        )}
        {[...groupedDisabledFeatures.keys()].map(key => {
          const disabledFeatures = groupedDisabledFeatures.get(key)
          const hasLimitsByModule =
            disabledFeatures?.find(feature => feature.featureDetail?.limit !== undefined) !== undefined
          const module = key?.toLowerCase() as Module
          return (
            <Layout.Vertical key={key} padding={{ bottom: 'large' }}>
              <Layout.Vertical padding={{ bottom: 'small' }}>
                {getHeader(key)}
                {disabledFeatures?.map(feature => (
                  <FeatureText key={feature.featureDetail?.featureName} feature={feature} module={key} />
                ))}
              </Layout.Vertical>
              <ModuleButtons module={module} hasLimit={hasLimitsByModule} />
            </Layout.Vertical>
          )
        })}
      </Layout.Vertical>
    )
  }

  function getTooltipBody(): React.ReactElement {
    // return customized warning message
    if (warningMessage) {
      return (
        <>
          <Text font={{ size: 'small' }} color={Color.WHITE} padding={{ bottom: 'large' }}>
            {warningMessage}
          </Text>
          <DefaultButtons feature={firstDisabledFeature} />
        </>
      )
    }

    // group by module messages if there are any
    return <GroupedTooltips />
  }

  return (
    <Layout.Vertical padding="medium" className={css.tooltip}>
      <Text
        icon="flash"
        color={Color.ORANGE_800}
        font={{ variation: FontVariation.FORM_MESSAGE_WARNING, weight: 'bold' }}
        iconProps={{ color: Color.ORANGE_800, size: 25 }}
        padding={{ bottom: 'xsmall' }}
      >
        {getString('common.levelUp')}
      </Text>
      {getTooltipBody()}
    </Layout.Vertical>
  )
}

export default FeatureTooltip
