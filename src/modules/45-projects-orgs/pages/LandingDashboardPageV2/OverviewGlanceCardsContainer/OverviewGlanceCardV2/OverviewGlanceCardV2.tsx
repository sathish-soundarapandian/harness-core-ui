/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import { numberFormatter } from '@common/utils/utils'
import css from './OverviewGlanceCardV2.module.scss'

export interface OverviewGlanceCardV2Props {
  count?: number
  label: keyof StringsMap
  loading: boolean
  className?: string
  countChangeInfo?: CountChangeAndCountChangeRateInfo
  redirectUrl?: string
}

interface DeltaProps {
  countChangeInfo: CountChangeAndCountChangeRateInfo
}
export const Delta: React.FC<DeltaProps> = ({ countChangeInfo }) => {
  const countChange = countChangeInfo?.countChange

  if (!countChange) {
    return null
  }

  const rateColor = countChange > 0 ? 'var(--green-800)' : 'var(--red-700)'
  const backgroundColor = countChange > 0 ? 'var(--green-50)' : 'var(--red-50)'

  return (
    <Layout.Horizontal className={css.deltaContainer} flex={{ justifyContent: 'center' }} style={{ backgroundColor }}>
      <Text font={{ variation: FontVariation.TINY_SEMI }} style={{ color: rateColor }} margin={{ right: 'xsmall' }}>
        {countChange > 0 ? '+' : '-'}
      </Text>
      <Text font={{ variation: FontVariation.TINY_SEMI }} style={{ color: rateColor }}>
        {new Intl.NumberFormat('default', {
          notation: 'compact',
          compactDisplay: 'short',
          unitDisplay: 'long',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(countChange)}
      </Text>
    </Layout.Horizontal>
  )
}

const OverviewGlanceCardV2: React.FC<OverviewGlanceCardV2Props> = props => {
  const { count, label, loading, className, countChangeInfo, redirectUrl } = props
  const { getString } = useStrings()
  const history = useHistory()

  if (loading) {
    return (
      <Container className={cx(css.container, className)} flex={{ justifyContent: 'center' }}>
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
      </Container>
    )
  }

  return (
    <Layout.Vertical
      data-testid="overviewcard"
      className={cx(css.container, { [css.active]: !!redirectUrl }, className)}
      onClick={() => {
        if (redirectUrl) {
          history.push(redirectUrl)
        }
      }}
    >
      <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY2 }} margin={{ bottom: 'small' }}>
        {getString(label)}
      </Text>
      <Text color={Color.GREY_600} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xsmall' }}>
        {numberFormatter(count)}
      </Text>
      {countChangeInfo ? <Delta countChangeInfo={countChangeInfo} /> : undefined}
      <Text font={{ variation: FontVariation.TINY }} className={css.viewAll} color={Color.PRIMARY_7}>
        {getString('common.viewAll')}
      </Text>
    </Layout.Vertical>
  )
}

export default OverviewGlanceCardV2
