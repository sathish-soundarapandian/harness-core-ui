/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { Layout } from '@harness/uicore'
import { defaultTo, toInteger } from 'lodash-es'
import type { PriceDTO } from 'services/cd-ng/index'
import type {
  Editions,
  ProductPricesProp,
  SubscriptionProps,
  Product,
  SampleData
} from '@common/constants/SubscriptionTypes'
import { TimeType } from '@common/constants/SubscriptionTypes'
import { getDollarAmount } from '@auth-settings/utils'
import type { Module } from 'framework/types/ModuleName'
import type { UsageAndLimitReturn } from '@common/hooks/useGetUsageAndLimit'
import FFDeveloperCard from './CostCalculator/FFDeveloperCard'
import FFMAUCard from './CostCalculator/FFMAUCard'
export const PLAN_TYPES: { [key: string]: string } = {
  DEVELOPERS: 'DEVELOPERS',
  MAU: 'MAU',
  MAU_SUPPORT: 'MAU_SUPPORT',
  PREMIUM_SUPPORT: 'PREMIUM_SUPPORT',
  DEVELOPERS_SUPPORT: 'DEVELOPERS_SUPPORT'
}
export function getRenewDate(time: TimeType): string {
  const today = new Date()
  if (time === TimeType.MONTHLY) {
    return new Date(today.setMonth(today.getMonth() + 1)).toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  return new Date(today.setFullYear(today.getFullYear() + 1)).toLocaleDateString('en-us', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getProductPrices(plan: Editions, time: TimeType, productPrices: ProductPricesProp): PriceDTO[] {
  const prices: PriceDTO[] = []

  if (time === TimeType.MONTHLY) {
    productPrices.monthly.forEach(price => {
      if (price.metaData?.edition?.includes(plan)) {
        prices.push(price)
      }
    })
  }

  if (time === TimeType.YEARLY) {
    productPrices.yearly.forEach(price => {
      if (price.metaData?.edition?.includes(plan)) {
        prices.push(price)
      }
    })
  }

  return prices
}

interface GetCostCalculatorBodyByModuleProps {
  module: Module
  currentPlan: Editions
  paymentFrequency: TimeType
  usageAndLimitInfo: UsageAndLimitReturn
  productPrices: ProductPricesProp
  subscriptionDetails: SubscriptionProps
  setSubscriptionDetails: (props: SubscriptionProps) => void
}

export function getCostCalculatorBodyByModule({
  module,
  currentPlan,
  usageAndLimitInfo,
  productPrices,
  paymentFrequency,
  subscriptionDetails,
  setSubscriptionDetails
}: GetCostCalculatorBodyByModuleProps): React.ReactElement {
  const { edition, paymentFreq } = subscriptionDetails
  const productPricesByPayFreq = getProductPrices(edition, paymentFreq, productPrices)
  switch (module) {
    case 'cf': {
      const planType = getPlanType(PLAN_TYPES.MAU)
      const sampleData = getSampleData(planType, productPricesByPayFreq)
      let licenseUnitPrice = getDollarAmount(
        productPricesByPayFreq.find(price => price.metaData?.type === getPlanType(PLAN_TYPES.DEVELOPERS))?.unitAmount
      )

      let mauUnitPrice = getDollarAmount(
        productPricesByPayFreq.find(price => price.metaData?.type === getPlanType(PLAN_TYPES.MAU))?.unitAmount
      )

      if (paymentFrequency === TimeType.YEARLY) {
        licenseUnitPrice = licenseUnitPrice / 12
        mauUnitPrice = mauUnitPrice / 12
      }

      if (!subscriptionDetails.sampleDetails?.sampleUnit && sampleData.sampleUnit) {
        setSubscriptionDetails({ ...subscriptionDetails, sampleDetails: sampleData })
      }
      return (
        <Layout.Vertical spacing={'large'} margin={{ bottom: 'large' }}>
          <FFDeveloperCard
            currentPlan={currentPlan}
            newPlan={edition}
            currentSubscribed={usageAndLimitInfo.limitData.limit?.ff?.totalFeatureFlagUnits || 0}
            unitPrice={licenseUnitPrice}
            usage={usageAndLimitInfo.usageData.usage?.ff?.activeFeatureFlagUsers?.count || 0}
            toggledNumberOfDevelopers={subscriptionDetails.quantities?.featureFlag?.numberOfDevelopers}
            setNumberOfDevelopers={(value: number) => {
              setSubscriptionDetails({
                ...subscriptionDetails,
                quantities: {
                  ...subscriptionDetails.quantities,
                  featureFlag: {
                    numberOfMau: subscriptionDetails.quantities?.featureFlag?.numberOfMau || sampleData.minValue,
                    numberOfDevelopers: value || 1
                  }
                }
              })
            }}
          />
          <FFMAUCard
            key={sampleData.minValue}
            minValue={sampleData.minValue}
            unit={sampleData.sampleUnit}
            currentPlan={currentPlan}
            newPlan={edition}
            paymentFreq={paymentFreq}
            currentSubscribed={usageAndLimitInfo.limitData.limit?.ff?.totalClientMAUs || 0}
            unitPrice={mauUnitPrice}
            usage={usageAndLimitInfo.usageData.usage?.ff?.activeClientMAUs?.count || 0}
            selectedNumberOfMAUs={defaultTo(
              subscriptionDetails.quantities?.featureFlag?.numberOfMau,
              sampleData.minValue
            )}
            setNumberOfMAUs={(value: number) => {
              setSubscriptionDetails({
                ...subscriptionDetails,
                quantities: {
                  ...subscriptionDetails.quantities,
                  featureFlag: {
                    numberOfMau: value || sampleData.minValue,
                    numberOfDevelopers: subscriptionDetails.quantities?.featureFlag?.numberOfDevelopers || 1
                  }
                }
              })
            }}
          />
        </Layout.Vertical>
      )
    }
  }

  return <></>
}

export function getTiltleByModule(module: Module): { icon?: string; description?: string } {
  let icon, description
  switch (module) {
    case 'cf': {
      icon = 'ff-solid'
      description = 'common.purpose.cf.continuous'
      break
    }
    case 'cd': {
      icon = 'cd-solid'
      description = 'common.purpose.cd.continuous'
      break
    }
    case 'ci': {
      icon = 'ci-solid'
      description = 'common.purpose.ci.continuous'
      break
    }
    case 'ce': {
      icon = 'ccm-solid'
      description = 'common.purpose.ce.continuous'
      break
    }
    case 'cv': {
      icon = 'cv-solid'
      description = 'common.purpose.cv.continuous'
      break
    }
    case 'sto': {
      icon = 'sto-color-filled'
      description = 'common.purpose.sto.continuous'
      break
    }
  }

  return { icon, description }
}

export function getSubscriptionBreakdownsByModuleAndFrequency({
  module,
  subscriptionDetails
}: {
  module: Module
  subscriptionDetails: SubscriptionProps
}): Product[] {
  const { productPrices, quantities, paymentFreq } = subscriptionDetails
  const products: Product[] = []
  switch (module) {
    case 'cf': {
      if (paymentFreq === TimeType.MONTHLY) {
        const developerUnitPrice = getDollarAmount(
          productPrices.monthly?.find(product => {
            return isSelectedPlan(product, false, subscriptionDetails.edition, PLAN_TYPES.DEVELOPERS)
          })?.unitAmount
        )
        products.push({
          paymentFrequency: paymentFreq,
          description: 'common.subscriptions.usage.developers',
          unitDescription: 'common.perDeveloper',
          quantity: quantities?.featureFlag?.numberOfDevelopers || 0,
          unitPrice: developerUnitPrice
        })

        const numberOfMauMonthly = quantities?.featureFlag?.numberOfMau || 0
        const mauUnitPrice = getDollarAmount(
          productPrices.monthly?.find(productPrice => {
            const numMausFromMap = numberOfMauMonthly * toInteger(productPrice.metaData?.sampleMultiplier)
            const priceMin = strToNumber(productPrice.metaData?.min || '')
            const priceMax = strToNumber(productPrice.metaData?.max || '')
            const isValidRange = numMausFromMap >= priceMin && numMausFromMap <= priceMax
            if (productPrice.metaData?.type === getPlanType(PLAN_TYPES.MAU) && isValidRange) {
              return productPrice
            }
          })?.unitAmount
        )
        products.push({
          paymentFrequency: paymentFreq,
          description: 'authSettings.costCalculator.maus',
          unitDescription: 'authSettings.costCalculator.mau.perkMau',
          underComment: 'authSettings.costCalculator.mau.kMauFree',
          quantity: numberOfMauMonthly,
          unitPrice: mauUnitPrice
        })
      }
      if (paymentFreq === TimeType.YEARLY) {
        const developerUnitPrice = getDollarAmount(
          productPrices.yearly?.find(product => {
            return isSelectedPlan(product, false, subscriptionDetails.edition, PLAN_TYPES.DEVELOPERS)
          })?.unitAmount
        )

        products.push({
          paymentFrequency: paymentFreq,
          description: 'common.subscriptions.usage.developers',
          unitDescription: 'common.perDeveloper',
          quantity: quantities?.featureFlag?.numberOfDevelopers || 0,
          unitPrice: developerUnitPrice
        })
        const numberOfMauYearly = quantities?.featureFlag?.numberOfMau || 0

        const mauUnitPrice = getDollarAmount(
          productPrices.yearly?.find(productPrice => {
            const isSamePlan = isSelectedPlan(productPrice, false, subscriptionDetails.edition, PLAN_TYPES.MAU)
            if (isSamePlan) {
              const numMausFromMap = numberOfMauYearly * toInteger(productPrice.metaData?.sampleMultiplier)
              const priceMin = strToNumber(productPrice.metaData?.min || '')
              const priceMax = strToNumber(productPrice.metaData?.max || '')
              const isValidRange = numMausFromMap >= priceMin && numMausFromMap <= priceMax
              if (isValidRange) {
                return productPrice
              }
            }
          })?.unitAmount
        )
        products.push({
          paymentFrequency: paymentFreq,
          description: 'authSettings.costCalculator.maus',
          unitDescription: 'authSettings.costCalculator.mau.permMau',
          underComment: 'authSettings.costCalculator.mau.mMauFree',
          quantity: numberOfMauYearly,
          unitPrice: mauUnitPrice
        })
      }
    }
  }

  return products
}

export const strToNumber = (str: string): number => {
  return Number.parseInt(str.replace(/,/g, ''))
}

export const getPlanType = (plan: string, isSupport?: boolean): string => {
  return isSupport ? `${PLAN_TYPES[plan]}_SUPPORT` : PLAN_TYPES[plan]
}

export const isSelectedPlan = (
  price: PriceDTO,
  premiumSupport: boolean,
  edition: string,
  planType: string
): boolean => {
  const hasSamePlan = price.metaData?.type === getPlanType(planType, premiumSupport)
  const hasSameEdition = price.metaData?.edition === edition
  if (hasSameEdition && hasSamePlan) {
    return true
  }
  return false
}

export const getSampleData = (planType: string, productPrices: PriceDTO[]): SampleData => {
  const sampleData: SampleData = { sampleUnit: '', sampleMultiplier: 0, minValue: 0 }
  productPrices.forEach(price => {
    if (price.metaData?.type === planType) {
      sampleData.sampleMultiplier = toInteger(price.metaData?.sampleMultiplier)
      sampleData.sampleUnit = price.metaData?.sampleUnit
      const currMinValue = toInteger(strToNumber(price.metaData?.min))
      sampleData.minValue = sampleData.minValue === 0 ? currMinValue : Math.min(sampleData.minValue, currMinValue)
    }
  })

  sampleData.minValue =
    (sampleData.minValue - (sampleData.minValue % sampleData.sampleMultiplier)) / sampleData.sampleMultiplier
  return sampleData
}
