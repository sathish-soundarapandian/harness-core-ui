/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { pick } from 'lodash-es'
import { Layout, PageSpinner, PageError } from '@harness/uicore'
import { useToaster } from '@common/components'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PlanActions, CreditCard } from '@common/constants/TrackingConstants'
import { useLicenseStore, handleUpdateLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStrings } from 'framework/strings'
import { StartTrialDTO, useGetLicensesAndSummary, useStartFreeLicense, useGetEditionActions } from 'services/cd-ng'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import routes from '@common/RouteDefinitions'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { ModuleName, Module as ModuleType } from 'framework/types/ModuleName'
import { ModuleLicenseType, Editions, SubscriptionTabNames } from '@common/constants/SubscriptionTypes'
import type { FetchPlansQuery } from 'services/common/services'
import { useSubscribeModal } from '@auth-settings/modals/Subscription/useSubscriptionModal'
import { getSavedRefererURL, getGaClientID, isOnPrem } from '@common/utils/utils'
import type { TimeType } from '@common/constants/SubscriptionTypes'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { getModuleToDefaultURLMap } from 'framework/LicenseStore/licenseStoreUtil'
import { getBtnProps } from './planUtils'
import type { PlanData, PlanProp } from './planUtils'
import Plan from './Plan'

type plansType = 'ciSaasPlans' | 'ffPlans' | 'cdPlans' | 'ccPlans'
interface PlanProps {
  plans: NonNullable<FetchPlansQuery['pricing']>[plansType]
  moduleName: ModuleName
  timeType: TimeType
}

export interface BtnProps {
  buttonText?: string
  btnLoading: boolean
  onClick?: () => void
  order: number
  isContactSales?: boolean
  isContactSupport?: boolean
  planDisabledStr?: string
}
export interface PlanCalculatedProps {
  btnProps: BtnProps[]
  currentPlanProps: {
    isCurrentPlan?: boolean
    isTrial?: boolean
    isPaid?: boolean
  }
}

const PlanContainer: React.FC<PlanProps> = ({ plans, timeType, moduleName }) => {
  const { showError } = useToaster()
  const { trackEvent } = useTelemetry()
  const { getString } = useStrings()
  const history = useHistory()
  const moduleType = moduleName as StartTrialDTO['moduleType']
  const module = moduleName.toLowerCase() as Module

  const isDefaultProjectCreated = useFeatureFlag(FeatureFlag.CREATE_DEFAULT_PROJECT)
  const { accountId } = useParams<{
    accountId: string
  }>()
  const refererURL = getSavedRefererURL()
  const gaClientID = getGaClientID()
  const { mutate: startFreePlan, loading: startingFreePlan } = useStartFreeLicense({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: moduleType,
      ...(refererURL ? { referer: refererURL } : {}),
      ...(gaClientID ? { gaClientId: gaClientID } : {})
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })
  const { licenseInformation, updateLicenseStore } = useLicenseStore()

  const {
    data: actions,
    loading: gettingActions,
    error: actionErrs,
    refetch: refetchActions
  } = useGetEditionActions({
    queryParams: {
      accountIdentifier: accountId,
      moduleType: moduleType
    }
  })

  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})

  function handleManageSubscription(): void {
    history.push(routes.toSubscriptions({ accountId, moduleCard: module, tab: 'OVERVIEW' }))
  }

  async function handleStartPlan(edition: Editions): Promise<void> {
    try {
      trackEvent(PlanActions.StartFreeClick, { category: Category.SIGNUP, module, plan: edition })
      const planData = await startFreePlan()

      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, planData?.data)

      const search = `?experience=${ModuleLicenseType.FREE}&&modal=${ModuleLicenseType.FREE}`

      if (moduleName === ModuleName.CE) {
        history.push({
          pathname: routes.toModuleHome({ accountId, module }),
          search
        })
        return
      }
      if (isDefaultProjectCreated) {
        const moduleUrlWithDefaultProject = getModuleToDefaultURLMap(accountId, module as ModuleType)[module]
        history.push(
          moduleUrlWithDefaultProject ? (moduleUrlWithDefaultProject as string) : routes.toHome({ accountId })
        )
      } else {
        history.push({
          pathname: routes.toModuleHome({ accountId, module }),
          search
        })
      }
    } catch (ex) {
      showError(ex.data?.message)
    }
  }

  const {
    data,
    error,
    refetch: refetchLicense,
    loading: gettingLicense
  } = useGetLicensesAndSummary({
    queryParams: { moduleType },
    accountIdentifier: accountId,
    lazy: true
  })

  const licenseData = data?.data

  const { openSubscribeModal } = useSubscribeModal({
    // refresh to fetch new license after subscribe
    onClose: () => {
      history.push(routes.toSubscriptions({ accountId, moduleCard: module, tab: SubscriptionTabNames.PLANS }))
    }
  })
  const isSelfService = licenseInformation?.[moduleType]?.selfService === true
  const isSelfServiceEnabled = !isOnPrem() && isSelfService

  useEffect(() => {
    refetchLicense()?.then(() => {
      const updatedLicenseInfo = licenseData && {
        ...licenseInformation?.[moduleType],
        ...pick(licenseData, ['licenseType', 'edition']),
        expiryTime: licenseData.maxExpiryTime
      }
      handleUpdateLicenseStore({ ...licenseInformation }, updateLicenseStore, module, updatedLicenseInfo)
    })
  }, [])

  function getPlanCalculatedProps(plan: PlanProp): PlanCalculatedProps {
    let isCurrentPlan, isPaid
    const planEdition = plan?.title && (plan?.title?.toUpperCase() as Editions)
    if (licenseData?.edition === planEdition) {
      isCurrentPlan = true
    }

    switch (licenseData?.licenseType) {
      case ModuleLicenseType.PAID:
        isPaid = true
        break
    }
    const btnLoading = startingFreePlan
    const btnProps = getBtnProps({
      plan,
      getString,
      handleStartPlan: (edition: Editions) => {
        handleStartPlan(edition)
      },
      handleContactSales: openMarketoContactSales,
      handleManageSubscription,
      handleUpgrade: () => {
        trackEvent(CreditCard.UpgradePlan, {
          category: Category.CREDIT_CARD,
          module,
          plan: planEdition || Editions.FREE
        })
        openSubscribeModal({
          _module: moduleName.toLowerCase() as ModuleType,
          _time: timeType,
          _plan: planEdition || Editions.FREE
        })
      },
      btnLoading,
      actions: actions?.data,
      isSelfServiceEnabled
    })

    return {
      currentPlanProps: {
        isCurrentPlan,
        // isTrial,
        isPaid
      },
      btnProps
    }
  }

  const calculatedPlans: PlanData[] = []

  plans?.map((plan: PlanProp) => {
    const calculatedProps = getPlanCalculatedProps(plan)
    const { btnProps, currentPlanProps } = calculatedProps
    calculatedPlans.push({ planProps: plan, btnProps, currentPlanProps })
  })

  if (gettingLicense || gettingActions || loadingContactSales) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError message={(error.data as Error)?.message} onClick={() => refetchLicense()} />
  }

  if (actionErrs) {
    return <PageError message={(actionErrs.data as Error)?.message} onClick={() => refetchActions()} />
  }
  return (
    <Layout.Horizontal spacing="large">
      {calculatedPlans?.map((plan: PlanData) => (
        <Plan key={plan.planProps?.title} plan={plan} timeType={timeType} module={moduleName} />
      ))}
    </Layout.Horizontal>
  )
}

export default PlanContainer
