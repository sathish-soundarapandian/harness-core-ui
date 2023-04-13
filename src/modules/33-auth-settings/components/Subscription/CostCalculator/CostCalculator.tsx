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
import { Module, ModuleName } from 'framework/types/ModuleName'
import {
  RetrieveProductPricesQueryParams,
  useRetrieveProductPrices,
  useRetrieveRecommendationRc,
  useGetAccountLicenses
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
import { useDeepCompareEffect, useMutateAsGet } from '@common/hooks'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { PLAN_TYPES } from '@auth-settings/components/Subscription/subscriptionUtils'
import ChoosePlan from './ChoosePlan'
import { Footer } from './Footer'
import { PremiumSupport } from './PremiumSupport'
import FFSubutils from '../FFSubutils'
import CISubutils from '../CISubutils'
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
interface GetCostCalculatorBodyByModuleProps {
  paymentFrequency: TimeType
  productPrices: ProductPricesProp
  subscriptionDetails: SubscriptionProps
  setSubscriptionDetails: (props: SubscriptionProps | ((old: SubscriptionProps) => SubscriptionProps)) => void
  recommendation: { [key: string]: number } | null
  updateQuantities: ({ maus, devs }: { maus?: number; devs?: number }) => void
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
  const [isPremiumSupported, setIsPremiumSupported] = useState<boolean>(false)
  const { data: accountLicensesData } = useGetAccountLicenses({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const allLicenses = accountLicensesData?.data?.allModuleLicenses || {}
  function getCostCalculatorBodyByModule({
    productPrices,
    paymentFrequency,
    subscriptionDetails,
    setSubscriptionDetails,
    recommendation,
    updateQuantities
  }: GetCostCalculatorBodyByModuleProps): React.ReactElement {
    switch (module) {
      case 'cf':
        return (
          <FFSubutils
            currentPlan={currentPlan}
            recommendation={recommendation}
            usageAndLimitInfo={usageAndLimitInfo}
            subscriptionDetails={subscriptionDetails}
            updateQuantities={updateQuantities}
            productPrices={productPrices}
            setSubscriptionDetails={setSubscriptionDetails}
            paymentFrequency={paymentFrequency}
          ></FFSubutils>
        )
      case 'ci': {
        return (
          <CISubutils
            currentPlan={currentPlan}
            recommendation={recommendation}
            usageAndLimitInfo={usageAndLimitInfo}
            subscriptionDetails={subscriptionDetails}
            updateQuantities={updateQuantities}
            productPrices={productPrices}
            setSubscriptionDetails={setSubscriptionDetails}
            paymentFrequency={paymentFrequency}
          ></CISubutils>
        )
      }
    }

    return <></>
  }
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

  const usageMapCF = {
    NUMBER_OF_USERS: usageAndLimitInfo.usageData.usage?.ff?.activeFeatureFlagUsers || 0,
    NUMBER_OF_MAUS: usageAndLimitInfo.usageData.usage?.ff?.activeClientMAUs || 0
  }
  const usageMapCI = {
    NUMBER_OF_COMMITTERS: usageAndLimitInfo.usageData.usage?.ci?.activeCommitters || 0
  }
  const { data: recommendation, refetch: fetchRecommendations } = useMutateAsGet(useRetrieveRecommendationRc, {
    body: {
      moduleType: module.toUpperCase(),
      usageMap: module.toUpperCase() === 'CF' ? usageMapCF : usageMapCI
    },
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })
  const prices = data?.data?.prices
  React.useEffect(() => {
    if (usageAndLimitInfo.usageData.usage?.ff || usageAndLimitInfo.usageData.usage?.ci) {
      fetchRecommendations()
    }
    if (Object.keys(allLicenses).length > 0) {
      const premSupport = allLicenses['CF']?.[0]?.premiumSupport || allLicenses['CI']?.[0]?.premiumSupport || false
      setSubscriptionProps({
        ...subscriptionProps,
        premiumSupport: premSupport
      })
      setIsPremiumSupported(premSupport)
    }
  }, [usageAndLimitInfo.usageData.usage?.ff, usageAndLimitInfo.usageData.usage?.ci, allLicenses])

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
    switch (module) {
      case 'cf':
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
        break
      case 'ci':
        setQuantities((oldData: SubscriptionProps['quantities']) => {
          let updatedQuantities = cloneDeep(oldData)
          if (devs) {
            updatedQuantities = {
              ...oldData,
              ci: {
                numberOfDevelopers: devs as number
              }
            }
          }

          return updatedQuantities
        })
        break
    }
  }

  return (
    <Layout.Vertical className={className}>
      <Header step={0} />
      <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.body}>
        <ChoosePlan
          allLicenses={allLicenses}
          plan={subscriptionProps.edition}
          module={module}
          setPlan={(value: Editions) => {
            let passedQuantities = {}
            if (
              value === Editions.ENTERPRISE &&
              subscriptionProps.quantities?.featureFlag?.numberOfMau === 100 &&
              module === ModuleName.CF.toLowerCase()
            ) {
              passedQuantities = {
                featureFlag: {
                  numberOfMau: 1,
                  numberOfDevelopers: subscriptionProps.quantities?.featureFlag?.numberOfDevelopers
                }
              }
            } else if (
              value === Editions.TEAM &&
              subscriptionProps.quantities?.featureFlag?.numberOfMau === 1 &&
              module === ModuleName.CF.toLowerCase()
            ) {
              passedQuantities = {
                featureFlag: {
                  numberOfMau: 100,
                  numberOfDevelopers: subscriptionProps.quantities?.featureFlag?.numberOfDevelopers
                }
              }
            }
            setSubscriptionProps({
              ...subscriptionProps,
              edition: value,
              sampleDetails: { sampleMultiplier: 0, sampleUnit: '', minValue: 0 },
              quantities: passedQuantities
            })
          }}
        />
        {getCostCalculatorBodyByModule({
          productPrices: subscriptionProps.productPrices,
          paymentFrequency: subscriptionProps.paymentFreq,
          subscriptionDetails: subscriptionProps,
          setSubscriptionDetails: setSubscriptionProps,
          recommendation: defaultTo(recommendation?.data, null),
          updateQuantities
        })}
        <PremiumSupport
          isAlreadyPrime={isPremiumSupported}
          premiumSupport={subscriptionProps.premiumSupport || isPremiumSupported}
          onChange={(value: boolean) => {
            setSubscriptionProps({
              ...subscriptionProps,
              premiumSupport: value
            })
          }}
          disabled={subscriptionProps.paymentFreq === TimeType.MONTHLY || isPremiumSupported}
        />
      </Layout.Vertical>
      <Footer setView={setView} disabled={isEmpty(subscriptionProps.quantities)} />
    </Layout.Vertical>
  )
}
