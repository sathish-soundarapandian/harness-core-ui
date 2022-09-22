/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize } from 'lodash-es'
import { Layout, Card, Text, Button, ButtonVariation, FontVariation, Color } from '@harness/uicore'
// import { useParams } from 'react-router-dom'
import { Editions, SubscribeViews } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
// import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
// import { useRetrieveSubscription } from 'services/cd-ng'
import css from './FinalReview.module.scss'

interface SubscriptionDetailsCardProps {
  newPlan: Editions
  items: string[]
  setView: (view: SubscribeViews) => void
  subscriptionId: string
}
const SubscriptionDetailsCard: React.FC<SubscriptionDetailsCardProps> = ({
  newPlan,
  items,
  setView
  // subscriptionId
}) => {
  const { getString } = useStrings()
  // const { accountId } = useParams<AccountPathProps>()

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const { data } = useRetrieveSubscription({ subscriptionId, queryParams: { accountIdentifier: accountId } })

  return (
    <Card>
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.H5 }} padding={{ bottom: 'large' }}>
          {getString('common.subscriptions.overview.details')}
        </Text>
        <Layout.Horizontal flex={{ justifyContent: 'start', alignItems: 'baseline' }} padding={{ bottom: 'small' }}>
          <Text padding={{ right: 'small' }}>{getString('authSettings.finalReview.upgradeToPlan')}</Text>
          <Text color={Color.GREY_900} font={{ weight: 'semi-bold' }}>{` ${capitalize(newPlan)} ${getString(
            'common.subscriptions.overview.plan'
          )}`}</Text>
          <Button
            variation={ButtonVariation.LINK}
            onClick={() => {
              setView(SubscribeViews.CALCULATE)
            }}
          >
            {getString('edit')}
          </Button>
        </Layout.Horizontal>
        <ul className={css.ul}>
          {items.map(item => {
            const isTaxItem = item?.includes('Sales Tax')
            return isTaxItem ? null : (
              <li key={item} className={css.li}>
                <Text>{item}</Text>
              </li>
            )
          })}
        </ul>
      </Layout.Vertical>
    </Card>
  )
}

export default SubscriptionDetailsCard
