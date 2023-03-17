import React from 'react'
import type { IItemRendererProps } from '@blueprintjs/select'
import { Layout, SelectOption, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { LogFeedback } from 'services/cv'
import RiskItemIndicator from './component/RiskItemIndicator'
import css from '../UpdateEventPreferenceDrawer.module.scss'

interface EventRiskItemProps {
  item: SelectOption
  handleClick: IItemRendererProps['handleClick']
}

function EventRiskItem({ item, handleClick }: EventRiskItemProps): JSX.Element {
  return (
    <Layout.Horizontal className={css.riskItem} onClick={handleClick}>
      <RiskItemIndicator risk={item.value as LogFeedback['feedbackScore']} />
      <Text color={Color.GREY_900}>{item.label}</Text>
    </Layout.Horizontal>
  )
}

export default React.memo(EventRiskItem)
