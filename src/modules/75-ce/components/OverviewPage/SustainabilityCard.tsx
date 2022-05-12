/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Color, FontVariation } from '@harness/design-system'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { String } from 'framework/strings'
import grayLeafImg from '@ce/common/images/gray-leaf.svg'
import css from './OverviewPage.module.scss'

interface SustainabilityCardProps {
  title: string
  firstColValue: string
  firstColText?: string
  secondColValue: string
  secondColText?: string
  className?: string
  fetching?: boolean
}

const SustainabilityCard: React.FC<SustainabilityCardProps> = props => {
  const { fetching, title, firstColValue, firstColText, secondColValue, secondColText, className } = props
  return (
    <div className={cx(css.sustainabilityCard, className)}>
      {fetching ? (
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="spinner" color="blue500" size={30} />
        </Layout.Horizontal>
      ) : (
        <>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <img src={grayLeafImg} width={16} />
            <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
              {title}
            </Text>
          </Layout.Horizontal>
          <Layout.Horizontal spacing={'huge'} margin={{ top: 'var(--spacing-medium)' }}>
            <Container>
              <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
                <String stringID="ce.common.emissionUnitHTML" vars={{ value: firstColValue }} useRichText />
              </Text>
              <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_500}>
                {firstColText}
              </Text>
            </Container>
            <Container>
              <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
                <String
                  stringID="ce.common.emissionUnitHTML"
                  vars={{
                    value: secondColValue
                  }}
                  useRichText
                />
              </Text>
              <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_500}>
                {secondColText}
              </Text>
            </Container>
          </Layout.Horizontal>
        </>
      )}
    </div>
  )
}

export default SustainabilityCard
