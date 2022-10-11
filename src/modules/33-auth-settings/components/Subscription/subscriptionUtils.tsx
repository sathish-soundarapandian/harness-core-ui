/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { Layout } from '@harness/uicore'
import { defaultTo, get, toInteger } from 'lodash-es'
import type { PriceDTO, SubscriptionDetailDTO } from 'services/cd-ng/index'
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
  setSubscriptionDetails: (props: SubscriptionProps | ((old: SubscriptionProps) => SubscriptionProps)) => void
  recommendation: { [key: string]: number } | null
  updateQuantities: ({ maus, devs }: { maus?: number; devs?: number | undefined }) => void
}

export function getCostCalculatorBodyByModule({
  module,
  currentPlan,
  usageAndLimitInfo,
  productPrices,
  paymentFrequency,
  subscriptionDetails,
  setSubscriptionDetails,
  recommendation,
  updateQuantities
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
            recommended={get(recommendation, 'data.NUMBER_OF_USERS', null)}
            currentSubscribed={usageAndLimitInfo.limitData.limit?.ff?.totalFeatureFlagUnits || 0}
            unitPrice={licenseUnitPrice}
            usage={usageAndLimitInfo.usageData.usage?.ff?.activeFeatureFlagUsers?.count || 0}
            toggledNumberOfDevelopers={subscriptionDetails.quantities?.featureFlag?.numberOfDevelopers}
            setNumberOfDevelopers={(value: number) => {
              updateQuantities({
                devs: value || 1
              })
            }}
          />
          <FFMAUCard
            getRecommendedNumbers={getRecommendedNumbers}
            recommended={get(recommendation, 'data.NUMBER_OF_MAUS', 0)}
            key={sampleData.minValue}
            minValue={sampleData.minValue}
            unit={sampleData.sampleUnit}
            sampleMultiplier={sampleData.sampleMultiplier}
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
              updateQuantities({
                maus: value || sampleData.minValue
              })
            }}
          />
        </Layout.Vertical>
      )
    }
  }

  return <></>
}

export function getTitleByModule(module: Module): { icon?: string; description?: string; title?: string } {
  let icon, description, title
  switch (module) {
    case 'cf': {
      icon = 'ff-solid'
      description = 'common.purpose.cf.continuous'
      title = 'common.moduleTitles.cf'
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

  return { icon, description, title }
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
            const isSamePlan = isSelectedPlan(productPrice, false, subscriptionDetails.edition, PLAN_TYPES.MAU)
            if (isSamePlan) {
              const numMausFromMap = numberOfMauMonthly * toInteger(productPrice.metaData?.sampleMultiplier)
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

export const strToNumber = (str = '0'): number => {
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

export const getSubscriptionByPaymentFrequency = (
  data: SubscriptionDetailDTO[]
): { [key: string]: SubscriptionDetailDTO[] } => {
  const subscriptionByPaymentFrequencyMap = {
    [TimeType.YEARLY]: [] as SubscriptionDetailDTO[],
    [TimeType.MONTHLY]: [] as SubscriptionDetailDTO[]
  }
  data.forEach(subs => {
    if (get(subs, 'latestInvoiceDetail.items[1].price.metaData.billed') === TimeType.YEARLY) {
      subscriptionByPaymentFrequencyMap[TimeType.YEARLY].push(subs)
    }
    if (get(subs, 'latestInvoiceDetail.items[1].price.metaData.billed') === TimeType.MONTHLY) {
      subscriptionByPaymentFrequencyMap[TimeType.MONTHLY].push(subs)
    }
  })
  return subscriptionByPaymentFrequencyMap
}

export const toDollars = (num = 0): number => (num === 0 ? 0 : num / 100)

export const getSampleMinValue = (unit?: string): string => (unit === 'K' ? `100K` : `1M`)

export const getQuantityFromValue = (value: string, multiplier: string, unit: string): string => {
  const currValue = toInteger(strToNumber(value))
  const sampleMultiplier = toInteger(strToNumber(multiplier))

  return `${currValue / sampleMultiplier}${unit}`
}
export const getRecommendedNumbers = (
  recommeneded: number,
  sampleMultiplier: number,
  valuesArray: number[]
): number => {
  let recommendedNumber = valuesArray[0]
  const recNum = recommeneded
  for (const value of valuesArray) {
    if (recNum < value * sampleMultiplier) {
      recommendedNumber = value
      break
    }
  }
  return recommendedNumber
}
