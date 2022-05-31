import React from 'react'
import { Layout } from '@harness/uicore'
import type { Module } from 'framework/types/ModuleName'
import type { SubscribeViews } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
import { Footer } from './Footer'
import { Header } from '../Header'

interface BillingInfoProps {
  module: Module
  setView: (view: SubscribeViews) => void
}
export const BillingInfo = ({ module, setView }: BillingInfoProps): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Header module={module} step={getString('authSettings.billing.step')} />
      <Footer setView={setView} />
    </Layout.Vertical>
  )
}
