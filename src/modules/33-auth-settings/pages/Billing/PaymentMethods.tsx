/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { FontVariation, Text, Card, Layout, Color, OverlaySpinner, ButtonVariation, Button } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useListPaymentMethods } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import amex from './images/amex.svg'
import visa from './images/visa.svg'
import discover from './images/discover.svg'
import mastercard from './images/mastercard.svg'
import css from './BillingPage.module.scss'

const cardByImageMap: { [key: string]: string } = {
  amex,
  discover,
  mastercard,
  visa
}
function PaymentMethods(): JSX.Element {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { data, loading } = useListPaymentMethods({
    queryParams: { accountIdentifier: accountId }
  })
  return (
    <OverlaySpinner show={loading}>
      <Card className={css.card}>
        <div className={css.adminAdd}>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.CARD_TITLE }}>
            {getString('authSettings.billingInfo.paymentMethods')}
          </Text>
          {!isEmpty(data?.data?.paymentMethods) && (
            <Button
              disabled
              tooltip={getString('common.featureComingSoon')}
              tooltipProps={{ isDark: true }}
              variation={ButtonVariation.LINK}
              text={getString('authSettings.billingInfo.updateCard')}
            />
          )}
        </div>

        {!isEmpty(data?.data?.paymentMethods) && (
          <Layout.Horizontal
            className={css.paymentMethodBody}
            padding={{ top: 'medium', right: 'medium', bottom: 'medium' }}
          >
            <div className={css.brandImage}>
              <img
                src={cardByImageMap[data?.data?.paymentMethods?.[0]?.brand as string]}
                alt={cardByImageMap[data?.data?.paymentMethods?.[0]?.brand as string]}
              />
            </div>
            <Layout.Vertical>
              <Text color={Color.BLACK} padding={{ bottom: 'xsmall' }}>
                {`${capitalize(data?.data?.paymentMethods?.[0]?.brand)} 
            ${getString('authSettings.billingInfo.endingIn')} ${data?.data?.paymentMethods?.[0]?.last4}
            `}
              </Text>
              <Text color={Color.GREY_700} font={{ size: 'xsmall' }}>
                {`${getString('authSettings.billingInfo.expires')} ${data?.data?.paymentMethods?.[0]?.expireMonth}/${
                  data?.data?.paymentMethods?.[0]?.expireYear
                }`}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        )}
        {/* add card experience to be enabled later */}
        {/* <div className={css.centerText}>
        <Text font={{ variation: FontVariation.BODY }}>{getString('authSettings.billingInfo.addCC')}</Text>
      </div> */}
      </Card>
    </OverlaySpinner>
  )
}

export default PaymentMethods
