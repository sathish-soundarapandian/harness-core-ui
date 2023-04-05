import React from 'react'
import CIDeveloperCard from './CostCalculator/CIDeveloperCard'
import { Layout } from '@harness/uicore'
import { get } from 'lodash-es'

import { TimeType, Editions, SubscriptionProps, ProductPricesProp } from '@common/constants/SubscriptionTypes'
import { getDollarAmount } from '@auth-settings/utils'
import { getProductPrices, getPlanType, getSampleData, PLAN_TYPES } from './subscriptionUtils'
import type { UsageAndLimitReturn } from '@common/hooks/useGetUsageAndLimit'

interface CISubutilsProps {
  currentPlan: Editions
  recommendation: { [key: string]: number } | null
  usageAndLimitInfo: UsageAndLimitReturn
  subscriptionDetails: SubscriptionProps
  updateQuantities: ({ maus, devs }: { maus?: number; devs?: number }) => void
  productPrices: ProductPricesProp
  setSubscriptionDetails: (props: SubscriptionProps | ((old: SubscriptionProps) => SubscriptionProps)) => void
  paymentFrequency: TimeType
}
const CISubutils: React.FC<CISubutilsProps> = ({
  currentPlan,
  recommendation,
  usageAndLimitInfo,
  subscriptionDetails,
  updateQuantities,
  productPrices,
  paymentFrequency,
  setSubscriptionDetails
}: CISubutilsProps) => {
  const { edition, paymentFreq } = subscriptionDetails
  const productPricesByPayFreq = getProductPrices(edition, paymentFreq, productPrices)
  const planType = getPlanType(PLAN_TYPES.DEVELOPERS)
  const sampleData = getSampleData(planType, productPricesByPayFreq)
  let licenseUnitPrice = getDollarAmount(
    productPricesByPayFreq.find(price => price.metaData?.type === getPlanType(PLAN_TYPES.DEVELOPERS))?.unitAmount
  )

  if (paymentFrequency === TimeType.YEARLY) {
    licenseUnitPrice = licenseUnitPrice / 12
  }

  if (!subscriptionDetails.sampleDetails?.sampleUnit && sampleData.sampleUnit) {
    setSubscriptionDetails({ ...subscriptionDetails, sampleDetails: sampleData })
  }

  return (
    <Layout.Vertical spacing={'large'} margin={{ bottom: 'large' }}>
      <CIDeveloperCard
        currentPlan={currentPlan}
        newPlan={edition}
        recommended={get(recommendation, 'data.NUMBER_OF_COMMITTERS', null)}
        currentSubscribed={
          usageAndLimitInfo.limitData.limit?.ci?.activeCommitters !== undefined &&
          usageAndLimitInfo.limitData.limit?.ci?.activeCommitters > 0
            ? usageAndLimitInfo.limitData.limit?.ci?.activeCommitters
            : 0
        }
        unitPrice={licenseUnitPrice}
        usage={usageAndLimitInfo.usageData.usage?.ci?.activeCommitters?.count || 0}
        toggledNumberOfDevelopers={subscriptionDetails.quantities?.ci?.numberOfDevelopers}
        setNumberOfDevelopers={(value: number) => {
          updateQuantities({
            devs: value
          })
        }}
      />
    </Layout.Vertical>
  )
}

export default CISubutils
