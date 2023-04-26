import React from 'react'
import { Layout } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import { TimeType, Editions, SubscriptionProps, ProductPricesProp } from '@common/constants/SubscriptionTypes'
import { getDollarAmount } from '@auth-settings/utils'
import type { UsageAndLimitReturn } from '@common/hooks/useGetUsageAndLimit'
import FFDeveloperCard from './CostCalculator/FFDeveloperCard'
import FFMAUCard from './CostCalculator/FFMAUCard'
import { getRecommendedNumbers, getProductPrices, getPlanType, getSampleData, PLAN_TYPES } from './subscriptionUtils'

interface FFSubutilsProps {
  currentPlan: Editions
  recommendation: { [key: string]: number } | null
  usageAndLimitInfo: UsageAndLimitReturn
  subscriptionDetails: SubscriptionProps
  updateQuantities: ({ maus, devs }: { maus?: number; devs?: number }) => void
  productPrices: ProductPricesProp
  setSubscriptionDetails: (props: SubscriptionProps | ((old: SubscriptionProps) => SubscriptionProps)) => void
  paymentFrequency: TimeType
}
const FFSubutils: React.FC<FFSubutilsProps> = ({
  currentPlan,
  recommendation,
  usageAndLimitInfo,
  subscriptionDetails,
  updateQuantities,
  productPrices,
  paymentFrequency,
  setSubscriptionDetails
}: FFSubutilsProps) => {
  const { edition, paymentFreq } = subscriptionDetails
  const productPricesByPayFreq = getProductPrices(edition, paymentFreq, productPrices)
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
        recommended={get(recommendation, 'NUMBER_OF_USERS', null)}
        currentSubscribed={usageAndLimitInfo.limitData.limit?.ff?.totalFeatureFlagUnits || 0}
        unitPrice={licenseUnitPrice}
        usage={usageAndLimitInfo.usageData.usage?.ff?.activeFeatureFlagUsers?.count || 0}
        toggledNumberOfDevelopers={subscriptionDetails.quantities?.featureFlag?.numberOfDevelopers}
        setNumberOfDevelopers={(value: number) => {
          if (subscriptionDetails.edition === 'ENTERPRISE' && value === 25) {
            value = 0
          }
          if (value > 0) {
            updateQuantities({
              devs: value
            })
          } else {
            updateQuantities({
              devs: subscriptionDetails?.quantities?.featureFlag?.numberOfDevelopers || 1
            })
          }
        }}
      />
      <FFMAUCard
        getRecommendedNumbers={getRecommendedNumbers}
        recommended={get(recommendation, 'NUMBER_OF_MAUS', 0)}
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
        selectedNumberOfMAUs={defaultTo(subscriptionDetails.quantities?.featureFlag?.numberOfMau, sampleData.minValue)}
        setNumberOfMAUs={(value: number) => {
          if (
            (subscriptionDetails.edition === 'TEAM' && value === 100) ||
            (subscriptionDetails.edition === 'ENTERPRISE' && value === 1)
          ) {
            value = 0
          }
          if (value > 0) {
            updateQuantities({
              maus: value
            })
          } else {
            updateQuantities({
              maus: subscriptionDetails?.quantities?.featureFlag?.numberOfMau || sampleData.minValue
            })
          }
        }}
      />
    </Layout.Vertical>
  )
}

export default FFSubutils
