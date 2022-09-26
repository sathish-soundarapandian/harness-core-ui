/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, PageError, Container } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { cloneDeep, defaultTo, isEmpty } from 'lodash-es'
import type { Module, ModuleName } from 'framework/types/ModuleName'
import {
  RetrieveProductPricesQueryParams,
  useRetrieveProductPrices,
  useRetrieveRecommendation
} from 'services/cd-ng/index'
import {
  Editions,
  SubscribeViews,
  SubscriptionProps,
  ProductPricesProp,
  TimeType,
  LookUpKeyFrequencyType
} from '@common/constants/SubscriptionTypes'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { useDeepCompareEffect } from '@common/hooks'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { getCostCalculatorBodyByModule, PLAN_TYPES } from '@auth-settings/components/Subscription/subscriptionUtils'
import ChoosePlan from './ChoosePlan'
import { Footer } from './Footer'
import { PremiumSupport } from './PremiumSupport'
import { Header } from '../Header'
import css from './CostCalculator.module.scss'

interface CostCalculatorProps {
  module: Module
  setView: (view: SubscribeViews) => void
  setSubscriptionProps: (props: SubscriptionProps | ((old: SubscriptionProps) => SubscriptionProps)) => void
  subscriptionProps: SubscriptionProps
  className: string
  onPriceSkewsLoad: (skews: { [key: string]: any }[]) => void
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({
  module,
  setView,
  setSubscriptionProps,
  subscriptionProps,
  onPriceSkewsLoad,
  className
}) => {
  const { licenseInformation } = useLicenseStore()
  const currentPlan = (licenseInformation[module.toUpperCase()]?.edition || Editions.FREE) as Editions
  const usageAndLimitInfo = useGetUsageAndLimit(module.toUpperCase() as ModuleName)
  const { accountId } = useParams<AccountPathProps>()
  const [quantities, setQuantities] = useState<SubscriptionProps['quantities'] | undefined>(
    subscriptionProps.quantities
  )
  const {
    data,
    loading: retrievingProductPrices,
    error: productPriceErr,
    refetch: retrieveProductPrices
  } = useRetrieveProductPrices({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: module.toUpperCase() as RetrieveProductPricesQueryParams['moduleType']
    }
  })
  const { data: recommendation, refetch: fetchRecommendations } = useRetrieveRecommendation({
    queryParams: {
      accountIdentifier: accountId,
      numberOfMAUs: defaultTo(usageAndLimitInfo.usageData.usage?.ff?.activeClientMAUs?.count, 0),
      numberOfUsers: defaultTo(usageAndLimitInfo.usageData.usage?.ff?.activeFeatureFlagUsers?.count, 0)
    },
    lazy: true
  })
  const prices = data?.data?.prices
  React.useEffect(() => {
    if (usageAndLimitInfo.usageData.usage?.ff) {
      fetchRecommendations()
    }
  }, [usageAndLimitInfo.usageData.usage?.ff])
  React.useEffect(() => {
    const newProductPrices: ProductPricesProp = { monthly: [], yearly: [] }
    if (prices) {
      prices.forEach(price => {
        if (price.metaData?.billed?.includes(LookUpKeyFrequencyType.MONTHLY)) {
          newProductPrices.monthly.push(price)
        }
        if (price.metaData?.billed?.includes(LookUpKeyFrequencyType.YEARLY)) {
          newProductPrices.yearly.push(price)
        }
        if (price.lookupKey === PLAN_TYPES.PREMIUM_SUPPORT) {
          newProductPrices.yearly.push(price)
        }
      })

      setSubscriptionProps({
        ...subscriptionProps,
        productPrices: newProductPrices
      })
      onPriceSkewsLoad(prices)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices])

  useDeepCompareEffect(() => {
    setSubscriptionProps({ ...subscriptionProps, quantities })
  }, [quantities])

  if (retrievingProductPrices) {
    return <ContainerSpinner />
  }

  if (productPriceErr) {
    return (
      <Container width={300}>
        <PageError message={productPriceErr.message} onClick={() => retrieveProductPrices()} />
      </Container>
    )
  }

  const updateQuantities = ({ maus, devs }: { maus?: number; devs?: number }): void => {
    setQuantities((oldData: SubscriptionProps['quantities']) => {
      let updatedQuantities = cloneDeep(oldData)
      if (devs) {
        updatedQuantities = {
          ...oldData,
          featureFlag: {
            numberOfMau: oldData?.featureFlag?.numberOfMau as number,
            numberOfDevelopers: devs as number
          }
        }
      } else if (maus) {
        updatedQuantities = {
          ...oldData,
          featureFlag: {
            numberOfMau: maus as number,
            numberOfDevelopers: oldData?.featureFlag?.numberOfDevelopers as number
          }
        }
      }
      return updatedQuantities
    })
  }
  return (
    <Layout.Vertical className={className}>
      <Header step={0} />
      <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.body}>
        <ChoosePlan
          plan={subscriptionProps.edition}
          module={module}
          setPlan={(value: Editions) => {
            setSubscriptionProps({
              ...subscriptionProps,
              edition: value,
              sampleDetails: { sampleMultiplier: 0, sampleUnit: '', minValue: 0 }
            })
          }}
        />
        {getCostCalculatorBodyByModule({
          module,
          currentPlan,
          usageAndLimitInfo,
          productPrices: subscriptionProps.productPrices,
          paymentFrequency: subscriptionProps.paymentFreq,
          subscriptionDetails: subscriptionProps,
          setSubscriptionDetails: setSubscriptionProps,
          recommendation: defaultTo(recommendation?.data, null),
          updateQuantities
        })}
        <PremiumSupport
          premiumSupport={subscriptionProps.premiumSupport}
          onChange={(value: boolean) => {
            setSubscriptionProps({
              ...subscriptionProps,
              premiumSupport: value
            })
          }}
          disabled={subscriptionProps.paymentFreq === TimeType.MONTHLY}
        />
      </Layout.Vertical>
      <Footer setView={setView} disabled={isEmpty(subscriptionProps.quantities)} />
    </Layout.Vertical>
  )
}
