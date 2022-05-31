import React from 'react'
import { Layout } from '@harness/uicore'
import type { Module } from 'framework/types/ModuleName'
import type { Editions, SubscribeViews } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
import { Footer } from './Footer'
import { Header } from '../Header'
import { SubscriptionDetails } from './SubscriptionDetails'

interface FinalReviewProps {
  module: Module
  setView: (view: SubscribeViews) => void
  plan: Editions
}
export const FinalReview = ({ module, setView, plan }: FinalReviewProps): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Header module={module} step={getString('authSettings.finalReview.step')} />
      <SubscriptionDetails plan={plan} />
      <Footer setView={setView} />
    </Layout.Vertical>
  )
}
