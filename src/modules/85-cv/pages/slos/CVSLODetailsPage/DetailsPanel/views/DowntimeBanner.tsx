/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonSize, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import type { UnavailabilityInstancesResponse } from 'services/cv'
import css from '../DetailsPanel.module.scss'

interface DowntimeBannerProps {
  showBanner: React.Dispatch<React.SetStateAction<boolean>>
  bannerData: UnavailabilityInstancesResponse[]
}

const DowntimeBanner = ({ showBanner, bannerData }: DowntimeBannerProps): JSX.Element => {
  const { getString } = useStrings()
  const currentDate = Date.now() / 1000
  const { startTime = currentDate, endTime = currentDate } = bannerData[0]

  return (
    <Container className={css.downtimeBanner}>
      <Layout.Horizontal
        className={css.iconWithText}
        width="96%"
        padding={{ left: 'xlarge' }}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <Text
          icon="info-messaging"
          color={Color.PRIMARY_10}
          font={{ variation: FontVariation.FORM_MESSAGE_WARNING, weight: 'bold' }}
          iconProps={{ padding: { right: 'medium' }, size: 24 }}
          padding={{ right: 'medium' }}
        >
          {getString('cv.sloDowntime.label').toUpperCase()}
        </Text>
        <Text color={Color.PRIMARY_10} font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}>
          {getString('cv.sloDowntime.bannerText', {
            startTime: moment(startTime * 1000).format('LLL'),
            endTime: moment(endTime * 1000).format('LLL')
          })}
        </Text>
      </Layout.Horizontal>
      <Button
        variation={ButtonVariation.ICON}
        size={ButtonSize.LARGE}
        icon="cross"
        data-testid="downtime-banner-dismiss"
        onClick={() => showBanner(false)}
      />
    </Container>
  )
}

export default DowntimeBanner
