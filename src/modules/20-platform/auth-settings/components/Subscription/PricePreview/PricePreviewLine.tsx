/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import type { StringsMap } from 'stringTypes'
import { useStrings } from 'framework/strings'
import { TimeType, CurrencyType } from '@common/constants/SubscriptionTypes'
import { getAmountInCurrency } from '@auth-settings/utils'
import css from './PricePreview.module.scss'

export interface LineProps {
  description: string
  unitPrice: number
  unitDescription?: string
  quantity?: number
  paymentFrequency: TimeType
  underComment?: string
  unit?: string
  isMau?: boolean
  minValue?: number
}

export const PricePreviewLine: React.FC<LineProps> = ({
  description,
  unitPrice,
  unitDescription,
  underComment,
  quantity = 0,
  paymentFrequency,
  unit = '',
  minValue = 0
}) => {
  const mauValue = quantity < minValue ? minValue : quantity
  const { getString } = useStrings()
  const isDevPreview = description?.includes('developers')
  const breakdownDescr = isDevPreview
    ? `${quantity}${isDevPreview ? '' : unit}  ${getString(
        quantity > 1 ? 'common.subscriptions.usage.developers' : 'common.subscriptions.usage.developer'
      )}/year`
    : `${mauValue}${isDevPreview ? '' : unit} ${getString(description as keyof StringsMap)}/year`

  const breakdownDescrMonthly = isDevPreview
    ? `${quantity}${isDevPreview ? '' : unit}  ${getString(
        quantity > 1 ? 'common.subscriptions.usage.developers' : 'common.subscriptions.usage.developer'
      )}/month`
    : `${mauValue}${isDevPreview ? '' : unit} ${getString(description as keyof StringsMap)}/month`
  const amount = isDevPreview ? quantity * unitPrice : unitPrice
  let unitDescr
  if (unitDescription && underComment) {
    unitDescr = (
      <Layout.Vertical>
        <Text>{breakdownDescr}</Text>
        <Text font={{ size: 'xsmall' }}>
          {minValue ? getString(underComment as keyof StringsMap, { minValue: `${minValue}${unit}` }) : null}
        </Text>
      </Layout.Vertical>
    )
  } else if (unitDescription) {
    unitDescr = <Text>{breakdownDescr}</Text>
  }
  let unitDescrMonthly
  if (unitDescription && underComment) {
    unitDescrMonthly = (
      <Layout.Vertical>
        <Text>{breakdownDescrMonthly}</Text>
        <Text font={{ size: 'xsmall' }}>
          {minValue ? getString(underComment as keyof StringsMap, { minValue: `${minValue}${unit}` }) : null}
        </Text>
      </Layout.Vertical>
    )
  } else if (unitDescription) {
    unitDescrMonthly = <Text>{breakdownDescrMonthly}</Text>
  }

  return (
    <Layout.Vertical className={css.line} padding={{ top: 'small', bottom: 'small' }}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'small' }}>
        {unitDescrMonthly}
        {
          <Text font={{ weight: 'semi-bold' }}>
            {getAmountInCurrency(CurrencyType.USD, paymentFrequency === TimeType.YEARLY ? amount / 12 : amount)}
            {getString('common.perMonth')}
          </Text>
        }
      </Layout.Horizontal>
      {paymentFrequency === TimeType.YEARLY ? (
        <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }}>
          {unitDescr}
          {amount && (
            <Text>
              {getAmountInCurrency(CurrencyType.USD, amount)}
              {paymentFrequency === TimeType.YEARLY && getString('common.perYear')}
            </Text>
          )}
        </Layout.Horizontal>
      ) : null}
    </Layout.Vertical>
  )
}
