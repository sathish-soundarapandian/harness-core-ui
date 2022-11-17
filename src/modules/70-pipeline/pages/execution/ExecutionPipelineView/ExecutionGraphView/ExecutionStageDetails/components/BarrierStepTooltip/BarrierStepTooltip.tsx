/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Spinner } from '@blueprintjs/core'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export interface BarrierStepTooltipProps {
  loading: boolean
  data?: any
  startTs?: number
}

export default function BarrierStepTooltip(props: BarrierStepTooltipProps): React.ReactElement {
  const { getString } = useStrings()
  const startTs = props?.startTs ? props?.startTs : 0
  let timeDiff = startTs + props.data?.timeoutIn - Date.now()
  timeDiff = timeDiff > 0 ? timeDiff : 0
  const timeoutData: { value: number; unit: string } = moment.duration(timeDiff, 'milliseconds').get('minutes')
    ? { value: moment.duration(timeDiff, 'milliseconds').get('minutes'), unit: 'min' }
    : { value: moment.duration(timeDiff, 'milliseconds').get('seconds'), unit: 'sec' }
  const altUnit = 'min'
  const altDuration = moment.duration(props.data?.timeoutIn, 'milliseconds').get('minutes')
  return props.loading ? (
    <Container border={{ top: true, width: 1, color: Color.GREY_200 }} padding={'medium'}>
      <Spinner size={24} />
    </Container>
  ) : (
    <Layout.Horizontal
      border={{ top: true, width: 1, color: Color.GREY_200 }}
      padding={{ right: 'medium', top: 'small', bottom: 'small', left: 'small' }}
    >
      <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
        <Icon name="timeout" size={20} />
      </Container>
      <Layout.Vertical spacing={'xsmall'} margin={{ right: 'medium' }} style={{ flex: 1 }}>
        <Text style={{ fontSize: '12px' }} font={{ weight: 'semi-bold' }} color={Color.BLACK}>
          {props.data?.name}
        </Text>
        <Text style={{ fontSize: '12px' }} color={Color.GREY_900} data-testid="hovercard-service">
          {getString('pipeline.barriers.tooltips.barrierWaiting')}
          {props.data?.stepParameters?.identifier}
        </Text>
      </Layout.Vertical>
      <Container>
        <Layout.Vertical
          background={Color.YELLOW_500}
          border={{ radius: 4 }}
          flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
          padding={'xsmall'}
        >
          <Text style={{ fontSize: '10px' }} font={{ weight: 'bold' }} color={Color.GREY_800}>
            {props?.startTs ? timeoutData.value : altDuration}
          </Text>
          <Text font={{ size: 'xsmall' }} color={Color.GREY_600}>
            {props?.startTs ? timeoutData.unit : altUnit}
          </Text>
        </Layout.Vertical>
      </Container>
    </Layout.Horizontal>
  )
}
