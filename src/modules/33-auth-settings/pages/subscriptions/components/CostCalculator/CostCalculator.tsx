import React from 'react'
import { Layout } from '@harness/uicore'
import type { Module } from 'framework/types/ModuleName'
import { Editions, SubscribeViews } from '@common/constants/SubscriptionTypes'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useStrings } from 'framework/strings'
import { CurrentSubscription } from './CurrentSubscription'
import { NewSubscription } from './NewSubscription'
import { Footer } from './Footer'
import { Billing } from './Billing'
import { Header } from '../Header'
import css from './CostCalculator.module.scss'

interface CostCalculatorProps {
  module: Module
  setView: (view: SubscribeViews) => void
  newPlan: Editions
}

export const CostCalculator = ({ module, setView, newPlan }: CostCalculatorProps): React.ReactElement => {
  const { licenseInformation } = useLicenseStore()
  const currentPlan = (licenseInformation[module.toUpperCase()]?.edition || Editions.FREE) as Editions
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Header module={module} step={getString('authSettings.costCalculator.step')} />
      <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.body}>
        <CurrentSubscription module={module} currentPlan={currentPlan} />
        <NewSubscription module={module} newPlan={newPlan} />
        <Billing module={module} />
      </Layout.Vertical>
      <Footer setView={setView} />
    </Layout.Vertical>
  )
}
