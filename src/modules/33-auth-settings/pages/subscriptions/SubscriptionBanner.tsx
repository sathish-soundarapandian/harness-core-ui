/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import cx from 'classnames'

import { capitalize } from 'lodash-es'
import { Container, Icon, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type { ModuleName } from 'framework/types/ModuleName'

import css from './SubscriptionsPage.module.scss'

interface SubscriptionBannerProps {
  edition: Editions
  module: ModuleName
  isExpired: boolean
  days: number
  expiredDays: number
}

const SubscriptionBanner = ({
  edition,
  module,
  isExpired,
  days,
  expiredDays
}: SubscriptionBannerProps): ReactElement => {
  const { getString } = useStrings()

  const moduleStr = getString(`common.module.${module.toLowerCase()}` as keyof StringsMap)
  const moduleTrialMessage = getString('common.subscriptions.banner.trial', {
    module: moduleStr,
    edition: capitalize(edition)
  })
  const expiryMessage = isExpired
    ? getString('common.subscriptions.expired', {
        days: expiredDays
      })
    : getString('common.subscriptions.expiryCountdown', {
        days
      })

  const bannerMessage = `${moduleTrialMessage} ${expiryMessage}`
  const bannerClassnames = cx(css.banner, isExpired ? css.expired : css.expiryCountdown)
  const color = isExpired ? Color.RED_700 : Color.ORANGE_700

  return (
    <Container
      padding="medium"
      intent="warning"
      width={350}
      flex={{
        justifyContent: 'start'
      }}
      className={bannerClassnames}
      font={{
        align: 'center'
      }}
    >
      <Icon name={'warning-sign'} size={15} className={css.bannerIcon} color={color} />
      <Text color={color}>{bannerMessage}</Text>
    </Container>
  )
}

export default SubscriptionBanner
