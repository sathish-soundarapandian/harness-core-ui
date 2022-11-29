import React from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import { numberFormatter } from '@common/utils/utils'
import { Delta } from '@common/components/ModuleColumnChart/ModuleColumnChart'
import css from './OverviewGlanceCardV2.module.scss'

export interface OverviewGlanceCardV2Props {
  count?: number
  delta?: JSX.Element
  label: keyof StringsMap
  loading: boolean
  className?: string
  countChangeInfo?: CountChangeAndCountChangeRateInfo
  redirectUrl?: string
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
