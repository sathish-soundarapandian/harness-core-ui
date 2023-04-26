/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { DowntimeStatusDetails } from 'services/cv'
import { DowntimeStatus } from '../../SLODowntimePage/SLODowntimePage.types'
import { getDowntimeStatusLabel } from '../../SLODowntimePage/components/DowntimeList/DowntimeList.utils'
import css from './DowntimeTooltip.module.scss'

export interface DowntimeTooltipProps {
  downtimeStatusDetails: DowntimeStatusDetails
  renderOnSLOListingPage?: boolean
  timezone?: string
}

const DowntimeTooltip = ({
  downtimeStatusDetails,
  timezone,
  renderOnSLOListingPage = false
}: DowntimeTooltipProps): JSX.Element => {
  const { getString } = useStrings()
  const { status, endTime = Date.now() / 1000, endDateTime } = downtimeStatusDetails

  return (
    <Layout.Vertical padding={'medium'} spacing={'xsmall'} className={css.tooltip}>
      {renderOnSLOListingPage ? (
        <>
          <Text className={css.bolder}>{getString('cv.sloDowntime.downtimeEndsOn')}</Text>
          <Text>{moment(endTime * 1000).format('LLLL')}</Text>
        </>
      ) : (
        <>
          <Text>{getDowntimeStatusLabel(getString, status)}</Text>
          {status === DowntimeStatus.ACTIVE && (
            <Text>
              <span className={css.bolder}>{getString('cv.ends')}</span> {moment(endDateTime).format('LLLL')} (
              {timezone})
            </Text>
          )}
        </>
      )}
    </Layout.Vertical>
  )
}

export default DowntimeTooltip
