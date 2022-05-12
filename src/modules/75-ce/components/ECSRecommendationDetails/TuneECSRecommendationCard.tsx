/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Container, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Slider } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

import css from './ECSRecommendationDetails.module.scss'

interface TuneECSRecommendationCardProps {
  buffer: number
  setBuffer: (newState: number) => void
}

const MIN_BUFFER_VALUE = 0
const MAX_BUFFER_VALUE = 100

const TuneECSRecommendationCard: React.FC<TuneECSRecommendationCardProps> = ({ buffer, setBuffer }) => {
  const { getString } = useStrings()

  return (
    <Card className={css.bufferCard}>
      <Text font={{ variation: FontVariation.H6 }} className={css.cardHeader}>
        {getString('ce.recommendation.detailsPage.setBuffer')}
      </Text>
      <Container className={css.cardBody}>
        <Text font={{ variation: FontVariation.SMALL_SEMI }}>
          {getString('ce.recommendation.detailsPage.memoryValueBuffer')}
        </Text>
        <Container className={css.sliderContainer}>
          <Text font={{ variation: FontVariation.SMALL_SEMI, align: 'right' }} margin={{ right: 'xxlarge' }}>
            {`${buffer}%`}
          </Text>
          <Layout.Horizontal style={{ alignItems: 'center' }} spacing="medium">
            <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_600}>
              {MIN_BUFFER_VALUE}
            </Text>
            <Slider
              min={MIN_BUFFER_VALUE}
              max={MAX_BUFFER_VALUE}
              stepSize={1}
              labelRenderer={false}
              value={buffer}
              onChange={/* istanbul ignore next */ val => setBuffer(val)}
              className={css.bufferSlider}
            />
            <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_600}>
              {MAX_BUFFER_VALUE}
            </Text>
          </Layout.Horizontal>
        </Container>
      </Container>
    </Card>
  )
}

export default TuneECSRecommendationCard
