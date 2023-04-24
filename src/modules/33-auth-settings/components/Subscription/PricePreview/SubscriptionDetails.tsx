/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { capitalize, isNil } from 'lodash-es'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { SubscriptionProps, Product, CurrencyType } from '@common/constants/SubscriptionTypes'
import { getAmountInCurrency } from '@auth-settings/utils'
import { PricePreviewLine } from './PricePreviewLine'
import css from './PricePreview.module.scss'

interface SubscriptionDetailsProps {
  subscriptionDetails: SubscriptionProps
  premiumSupportAmount: number
  products: Product[]
  totalAmount?: number
}

const TaxLine: React.FC<{ taxAmount?: number }> = ({ taxAmount }) => {
  const { getString } = useStrings()
  const taxAmountDescr = !isNil(taxAmount) ? taxAmount : getString('authSettings.pricePreview.calculatedNextStep')
  return (
    <Layout.Horizontal
      flex={{ justifyContent: 'space-between' }}
      className={css.line}
      padding={{ top: 'small', bottom: 'small' }}
    >
      <Text>{getString('authSettings.costCalculator.tax')}</Text>
      <Text>{`$${taxAmountDescr}`}</Text>
    </Layout.Horizontal>
  )
}

const PremiumSupportLine: React.FC<{ premiumSupportAmount: number }> = ({ premiumSupportAmount }) => {
  const { getString } = useStrings()
  const premiumSupportAmountDescr = premiumSupportAmount
    ? getAmountInCurrency(CurrencyType.USD, premiumSupportAmount)
    : getString('authSettings.pricePreview.calculatedNextStep')
  return (
    <Layout.Horizontal
      flex={{ justifyContent: 'space-between' }}
      className={css.line}
      padding={{ top: 'small', bottom: 'small' }}
    >
      <Text>{getString('authSettings.costCalculator.premiumSupport')}</Text>
      <Text>{`${premiumSupportAmountDescr}`}</Text>
    </Layout.Horizontal>
  )
}
const TotalAmount: React.FC<{ totalAmount: number }> = ({ totalAmount }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal
      flex={{ justifyContent: 'space-between' }}
      className={css.line}
      padding={{ top: 'small', bottom: 'small' }}
    >
      <Text>{getString('total')}</Text>
      <Text>{getAmountInCurrency(CurrencyType.USD, totalAmount)}</Text>
    </Layout.Horizontal>
  )
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({
  subscriptionDetails,
  products,
  premiumSupportAmount,
  totalAmount
}) => {
  const { getString } = useStrings()
  const { premiumSupport } = subscriptionDetails
  const unit = subscriptionDetails?.sampleDetails?.sampleUnit
  const minValue = subscriptionDetails?.sampleDetails?.minValue

  return (
    <Layout.Vertical padding={{ bottom: 'large' }} spacing="large">
      <Text>{getString('common.subscriptions.overview.details')}</Text>
      <Text color={Color.BLACK} font={{ weight: 'bold' }}>{`${capitalize(subscriptionDetails.edition)} ${getString(
        'common.subscriptions.overview.plan'
      )}`}</Text>
      {products.map(product => {
        return <PricePreviewLine {...product} key={product.description} unit={unit} minValue={minValue} />
      })}
      {premiumSupport && <PremiumSupportLine premiumSupportAmount={premiumSupportAmount} />}
      {<TotalAmount totalAmount={totalAmount || 0} />}
      {!isNil(subscriptionDetails.taxAmount) && <TaxLine taxAmount={subscriptionDetails.taxAmount} />}

      {isNil(subscriptionDetails.taxAmount) && (
        <Text font={{ size: 'xsmall' }}>{getString('authSettings.salesTax')}</Text>
      )}
    </Layout.Vertical>
  )
}

export default SubscriptionDetails
