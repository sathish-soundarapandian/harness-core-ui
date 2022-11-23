/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Spinner } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export interface BarrierStageTooltipProps {
  loading: boolean
  data?: any
  stageName: string
}

export default function BarrierStageTooltip(props: BarrierStageTooltipProps): React.ReactElement {
  const { getString } = useStrings()
  return props.loading ? (
    <Container border={{ top: true, width: 1, color: Color.GREY_100 }} padding={'medium'}>
      <Spinner size={24} />
    </Container>
  ) : (
    <Container>
      {props?.data.map((barrier: any) => {
        let timeDiff = barrier?.startedAt + barrier?.timeoutIn - Date.now()
        timeDiff = timeDiff > 0 ? timeDiff : 0
        const timeoutData: { value: number; unit: string } = moment.duration(timeDiff, 'milliseconds').get('minutes')
          ? { value: moment.duration(timeDiff, 'milliseconds').get('minutes'), unit: 'min' }
          : { value: moment.duration(timeDiff, 'milliseconds').get('seconds'), unit: 'sec' }
        const altUnit = 'min'
        const altDuration = moment.duration(barrier?.timeoutIn, 'milliseconds').get('minutes')

        return (
          <Layout.Horizontal
            key={barrier.identifier}
            border={{ top: true, width: 1, color: Color.GREY_100 }}
            padding={{ right: 'medium', top: 'small', bottom: 'small', left: 'small' }}
          >
            <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
              <Icon name="barrier-open-with-links" size={20} />
            </Container>
            <Layout.Vertical
              spacing={'xsmall'}
              margin={{ right: 'medium' }}
              padding={{ top: 'xsmall', bottom: 'xsmall' }}
              style={{ flex: 1 }}
            >
              <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
                {barrier.name}
              </Text>
              <Text font={{ size: 'small' }} color={Color.GREY_900} data-testid="hovercard-service">
                {getString('pipeline.barriers.tooltips.barrierWaiting')}
                {barrier.identifier} | {getString('pipeline.execution.stageTitlePrefix')}
                {props?.stageName}
              </Text>
            </Layout.Vertical>
            <Container>
              <Layout.Vertical
                background={Color.YELLOW_500}
                border={{ radius: 4, color: Color.YELLOW_500 }}
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
              >
                <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.GREY_800}>
                  {barrier?.startedAt > 0 ? timeoutData.value : altDuration}
                </Text>
                <Text style={{ fontSize: '8px' }} color={Color.GREY_500}>
                  {barrier?.startedAt > 0 ? timeoutData.unit : altUnit}
                </Text>
              </Layout.Vertical>
            </Container>
          </Layout.Horizontal>
        )
      })}
    </Container>
  )
}
