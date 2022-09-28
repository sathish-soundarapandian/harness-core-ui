/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { FontVariation, Text, Card, Layout, Color, OverlaySpinner, Button, ButtonVariation } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './BillingPage.module.scss'
export interface ActiveSubscriptionDetails {
  activeSubscriptionCount: number
  hasTeam: boolean
  hasEnterprise: boolean
  hasPremiumSupport: boolean
}
function ActiveSubscriptionCard({
  loading,
  activeSubscriptionDetails
}: {
  loading: boolean
  activeSubscriptionDetails: ActiveSubscriptionDetails
}): JSX.Element {
  const { getString } = useStrings()

  return (
    <OverlaySpinner show={loading}>
      <Card className={css.card}>
        <div className={css.adminAdd}>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.CARD_TITLE }}>
            {getString('common.subscriptions.title')}
          </Text>
        </div>

        <Layout.Horizontal
          className={cx(css.paymentMethodBody, css.activeSubscriptionCard)}
          padding={{ top: 'medium', right: 'medium', bottom: 'medium' }}
        >
          {activeSubscriptionDetails.activeSubscriptionCount > 0 ? (
            <>
              <Text font={{ size: 'large' }} padding={{ right: 'xxlarge' }} color={Color.BLACK}>
                {activeSubscriptionDetails.activeSubscriptionCount}
              </Text>
              <Layout.Vertical>
                <Layout.Horizontal>
                  <Text font={{ size: 'large', weight: 'bold' }} color={Color.BLACK} padding={{ bottom: 'xsmall' }}>
                    {activeSubscriptionDetails.hasEnterprise
                      ? getString('authSettings.cdCommunityPlan.enterpriseTitle')
                      : getString('authSettings.ffPlans.team')}
                  </Text>
                  <Text
                    className={css.planTitle}
                    font={{ weight: 'bold' }}
                    color={Color.BLACK}
                    padding={{ bottom: 'xsmall' }}
                  >
                    {getString('common.subscriptions.overview.plan')}
                  </Text>
                </Layout.Horizontal>
                {!activeSubscriptionDetails.hasPremiumSupport && (
                  <Button
                    className={css.supportButton}
                    font={{ size: 'small' }}
                    text={getString('authSettings.costCalculator.premiumSupport')}
                    variation={ButtonVariation.LINK}
                  />
                )}
              </Layout.Vertical>
            </>
          ) : (
            <Text font={{ weight: 'bold' }} color={Color.BLACK}>
              {getString('none')}
            </Text>
          )}
        </Layout.Horizontal>
      </Card>
    </OverlaySpinner>
  )
}

export default ActiveSubscriptionCard
