import React from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import css from './OverviewGlanceCardV2.module.scss'

export interface OverviewGlanceCardV2Props {
  count?: number
  delta?: JSX.Element
  label: keyof StringsMap
  loading: boolean
  className?: string
  countChangeInfo?: CountChangeAndCountChangeRateInfo
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

  return (
    <Layout.Horizontal>
      <Icon
        size={14}
        name={countChange > 0 ? 'caret-up' : 'caret-down'}
        style={{
          color: rateColor
        }}
      />
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
  const { count, label, loading, className, countChangeInfo } = props
  const { getString } = useStrings()

  if (loading) {
    return (
      <Container className={css.container} flex={{ justifyContent: 'center' }}>
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
      </Container>
    )
  }

  return (
    <Layout.Vertical
      className={cx(css.container, className)}
      padding={{ top: 'medium', bottom: 'medium', left: 'small', right: 'small' }}
    >
      <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY2 }} margin={{ bottom: 'large' }}>
        {getString(label)}
      </Text>
      <Layout.Horizontal flex>
        <Text color={Color.GREY_600} font={{ variation: FontVariation.H3 }}>
          {count}
        </Text>
        {countChangeInfo ? <Delta countChangeInfo={countChangeInfo} /> : undefined}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default OverviewGlanceCardV2
