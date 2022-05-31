import React, { useState } from 'react'
import { Text, Layout, PillToggle, Container, Checkbox } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { capitalize } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { TimeType } from '@common/constants/SubscriptionTypes'
import type { Module } from 'framework/types/ModuleName'
import { FFEquation } from './FFEquation'
import css from './CostCalculator.module.scss'

const Header = ({ time, setTime }: { time: TimeType; setTime: (time: TimeType) => void }): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical className={css.billingHeader} padding={{ top: 'large', bottom: 'large' }}>
      <Text padding={{ bottom: 'large' }} font={{ variation: FontVariation.BODY1, weight: 'bold' }}>
        {getString('common.subscriptions.tabs.billing')}
      </Text>
      <PillToggle
        onChange={timeClicked => setTime(timeClicked)}
        options={[
          { label: capitalize(TimeType.YEARLY), value: TimeType.YEARLY },
          {
            label: capitalize(TimeType.MONTHLY),
            value: TimeType.MONTHLY
          }
        ]}
        selectedView={time}
      />
    </Layout.Vertical>
  )
}

function getEquationByModule(module: Module): React.ReactElement {
  switch (module) {
    case 'cf': {
      return <FFEquation />
    }
    default:
      return <></>
  }
}

const PremLabel = (): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text padding={{ bottom: 'xsmall' }}>{getString('authSettings.billing.premSupport.title')}</Text>
      <ul className={css.premLabel}>
        <li key={'line1'}>
          <Text font={{ size: 'xsmall' }}>{getString('authSettings.billing.premSupport.line1')}</Text>
        </li>
        <li key={'line2'}>
          <Text font={{ size: 'xsmall' }}>{getString('authSettings.billing.premSupport.line2')}</Text>
        </li>
        <li key={'line3'}>
          <Text font={{ size: 'xsmall' }}>{getString('authSettings.billing.premSupport.line3')}</Text>
        </li>
      </ul>
    </Layout.Vertical>
  )
}

const PremiumSupport = ({
  value,
  onChange,
  disabled
}: {
  value: boolean
  onChange: (value: boolean) => void
  disabled: boolean
}): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Container className={css.premSupport}>
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'start' }} padding={'small'}>
        <Layout.Horizontal>
          <Checkbox checked={value} onChange={() => onChange(!value)} disabled={disabled} />
          <PremLabel />
        </Layout.Horizontal>
        <Text font={{ size: 'xsmall' }}>{getString('authSettings.billing.premSupport.includedByDefault')}</Text>
      </Layout.Horizontal>
    </Container>
  )
}

export const Billing = ({ module }: { module: Module }): React.ReactElement => {
  const [time, setTime] = useState<TimeType>(TimeType.YEARLY)
  const [prem, setPrem] = useState<boolean>(false)
  const premDisabled = time === TimeType.MONTHLY
  return (
    <Layout.Vertical spacing={'large'} padding={{ bottom: 'large' }}>
      <Header
        time={time}
        setTime={(newTime: TimeType) => {
          setTime(newTime)
          if (newTime === TimeType.MONTHLY) {
            setPrem(false)
          }
        }}
      />
      {getEquationByModule(module)}
      <PremiumSupport disabled={premDisabled} onChange={setPrem} value={prem} />
    </Layout.Vertical>
  )
}
