/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useParams } from 'react-router-dom'
import type { PlanType } from '@auth-settings/pages/subscriptions/components/CostCalculator/CostCalculatorUtils'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { GetEditionBox } from '@auth-settings/pages/subscriptions/components/CostCalculator/CostCalculator'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useListSubscriptions } from 'services/cd-ng'
import css from '@auth-settings/pages/subscriptions/components/CostCalculator/CostCalculator.module.scss'

interface ReviewPageParams {
  previousEdition: Editions
  previousPlan?: PlanType
  newEdition: Editions
  newPlan: PlanType
  previousDevelopers: number
  previousMau: number
  newDevelopers: number
  developerCost: number
  newMau: number
  mauCost: number
  supportCost: number
  total: number
  clientSecret: string
  backButtonClick: () => void
}

const stripePromise = loadStripe(
  'pk_test_51IykZ0Iqk5P9Eha3uhZUAnFuUWzaLLSa2elWpGBCF7uGpDU5rOcuX8PQew7hI947J9Lefh4qmQniY11HyXcUyBXD00aayEoMmU'
)

interface JustStripeDataParams {
  clientSecret: string
}

const DoCheckout = () => {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    const result = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: window.location.href //"https://example.com/order/123/complete",
      }
    })

    if (result.error) {
      // Show error to your customer (for example, payment details incomplete)
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  }

  return (
    <>
      <Layout.Vertical padding={{ left: 'xlarge', right: 'xlarge' }}>
        <Text font={{ variation: FontVariation.H4 }}>Payment Information</Text>
        <PaymentElement />
      </Layout.Vertical>
      <Button intent={'primary'} size={ButtonSize.LARGE} disabled={!stripe} onClick={handleSubmit}>
        Subscribe and Pay
      </Button>
    </>
  )
}

const JustStripeData = ({ clientSecret }: JustStripeDataParams) => {
  const options = {
    // passing the client secret obtained from the server
    clientSecret: clientSecret
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <DoCheckout />
    </Elements>
  )
}

export const ReviewPage = ({
  previousEdition,
  previousPlan,
  newEdition,
  newPlan,
  previousDevelopers,
  previousMau,
  newDevelopers,
  developerCost,
  newMau,
  mauCost,
  supportCost,
  total,
  clientSecret,
  backButtonClick
}: ReviewPageParams) => {
  const reviewTitle = `Feature Flag Subscription`
  const { accountId } = useParams<AccountPathProps>()
  const subList = useListSubscriptions({ queryParams: { accountIdentifier: accountId, moduleType: 'CF' } })
  const acquiredSub = subList.data?.data
  let cl = clientSecret
  let proratedCost = 0

  if (acquiredSub) {
    const acqSubscription = acquiredSub[0]
    cl = (cl === '' ? acqSubscription.clientSecret : clientSecret) || clientSecret
    let totalCent = acqSubscription.latestInvoiceDetail?.totalAmount
    totalCent = totalCent ? totalCent / 100 : total
    proratedCost = totalCent
  }

  return (
    <Container className={css.subscriptionReviewContainer}>
      <Layout.Vertical flex={{ justifyContent: 'left', alignItems: 'stretch' }}>
        <Text
          icon={'ff-solid'}
          iconProps={{ size: 24 }}
          font={{ variation: FontVariation.H3 }}
          className={cx(css.textwrap)}
        >
          {reviewTitle}
        </Text>
        <Layout.Vertical>
          <Container className={cx(css.reviewContainer)}>
            <Layout.Horizontal className={cx(css.currentPlanContainer, css.pillboxgap)}>
              <Text font={{ variation: FontVariation.H4 }}>{`Current Plan`}</Text>
              <GetEditionBox editionType={previousEdition} />
              {previousPlan && <GetEditionBox editionType={previousPlan} />}
            </Layout.Horizontal>
            <Text font={{ size: 'normal' }} className={cx(css.currentDeveloperPlan, css.reviewText)}>
              Developers
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.currentDeveloperPlan, css.reviewItems)}>
              {previousDevelopers}
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.currentMauPlan, css.reviewText)}>
              MAUs
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.currentMauPlan, css.reviewItems)}>
              {previousMau}
            </Text>
            <Layout.Horizontal className={cx(css.changingText, css.pillboxgap)}>
              <Text font={{ variation: FontVariation.H4 }}>{`New plan`}</Text>
              <GetEditionBox editionType={newEdition} />
              <GetEditionBox editionType={newPlan} />
            </Layout.Horizontal>

            <Text font={{ size: 'normal' }} className={cx(css.changedDevelopers, css.reviewText)}>
              Developers
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.changedDevelopers, css.reviewItems)}>
              {newDevelopers}
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.developerUnitPrice, css.reviewText)}>
              Unit price
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.developerUnitPrice, css.reviewItems)}>
              {developerCost / newDevelopers}
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.changedMaus, css.reviewText)}>
              MAUs
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.changedMaus, css.reviewItems)}>
              {newMau}
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.mauUnitPrice, css.reviewText)}>
              Unit price
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.mauUnitPrice, css.reviewItems)}>
              {mauCost / (newMau / 25)}
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.premiumSupport, css.reviewText)}>
              Support
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.premiumSupport, css.reviewItems)}>
              {supportCost}
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.tax, css.reviewText)}>
              Tax
            </Text>
            <Text font={{ size: 'normal' }} className={cx(css.tax, css.reviewItems)}>
              {0}
            </Text>
            <Text font={{ size: 'normal', weight: 'bold' }} className={cx(css.newRate, css.reviewText)}>
              New total
            </Text>
            <Text font={{ size: 'normal', weight: 'bold' }} className={cx(css.newRate, css.reviewItems)}>
              {total}
            </Text>
            <Text font={{ size: 'normal', weight: 'bold' }} className={cx(css.proratedAmount, css.reviewText)}>
              Prorated amount
            </Text>
            <Text font={{ size: 'normal', weight: 'bold' }} className={cx(css.proratedAmount, css.reviewItems)}>
              {proratedCost}
            </Text>
          </Container>
          <Container className={cx(css.reviewProratedDueToday)}>
            <Text font={{ variation: FontVariation.H4 }} className={cx(css.dueToday)}>
              Prorated Amount Due Today
            </Text>
            <Text font={{ variation: FontVariation.SMALL }} className={cx(css.dueTodaySummary)}>
              Your plan changes take effect today. Full renewal amount will be charged at your next billing cycle.
            </Text>
            <Text font={{ variation: FontVariation.H4 }} className={cx(css.dueTodayPrice)}>
              {proratedCost}
            </Text>
          </Container>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical className={cx(css.paymentBox)}>
        <JustStripeData clientSecret={cl} />
      </Layout.Vertical>
      <Layout.Vertical className={cx(css.backButtonBox)} flex={{ alignItems: 'flex-start', justifyContent: 'left' }}>
        <Button variation={ButtonVariation.SECONDARY} onClick={backButtonClick}>
          Back
        </Button>
      </Layout.Vertical>
    </Container>
  )
}
