/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { capitalize, defaultTo } from 'lodash-es'
import { Card, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { Editions } from '@common/constants/SubscriptionTypes'
import SliderBar from './SliderBar'
import { Item, Header } from './FFDeveloperCard'
import css from './CostCalculator.module.scss'

const generateRangeArray = (min: number, max: number): number[] => {
  const rangeArray = []
  for (let i = min; i <= max; i += 1) {
    rangeArray[i] = i
  }
  return rangeArray
}

interface DeveloperSubscriptionInfoProps {
  currentSubscribed: number
  usage: number
  currentPlan: Editions
  recommended: number | null
}

const DeveloperSubscriptionInfo: React.FC<DeveloperSubscriptionInfoProps> = ({
  currentSubscribed,
  usage,
  currentPlan,
  recommended
}) => {
  const { getString } = useStrings()
  const currentPlanDescr = (
    <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'baseline', justifyContent: 'start' }}>
      <Text font={{ weight: 'bold' }}>{currentSubscribed}</Text>
      <Text color={Color.PRIMARY_7} font={{ size: 'xsmall', weight: 'bold' }}>
        {`${capitalize(currentPlan)} ${getString('common.subscriptions.overview.plan')}`}
      </Text>
    </Layout.Horizontal>
  )
  const recommendedNumber = defaultTo(recommended, Math.max(Math.ceil(usage * 1.2), currentSubscribed))
  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} className={css.subscriptionInfo}>
      <Layout.Horizontal>
        <Item title={getString('authSettings.costCalculator.currentSubscribed')} value={currentPlanDescr} />
      </Layout.Horizontal>
      <Layout.Horizontal>
        <Item
          title={getString('authSettings.costCalculator.using')}
          value={<Text font={{ weight: 'bold' }}>{usage}</Text>}
        />
      </Layout.Horizontal>
      <Layout.Horizontal className={css.subscriptionInfo}>
        <Item
          title={getString('authSettings.recommendation')}
          value={
            <Text color={Color.PRIMARY_7} font={{ weight: 'bold' }}>
              {recommendedNumber}
            </Text>
          }
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

interface CIDeveloperCardProps {
  unitPrice: number
  currentSubscribed: number
  usage: number
  currentPlan: Editions
  newPlan: Editions
  toggledNumberOfDevelopers?: number
  setNumberOfDevelopers: (value: number) => void
  recommended: number | null
}

const CIDeveloperCard: React.FC<CIDeveloperCardProps> = ({
  unitPrice,
  currentSubscribed,
  usage,
  currentPlan,
  newPlan,
  toggledNumberOfDevelopers,
  setNumberOfDevelopers,
  recommended
}) => {
  const numberOfDevelopers = toggledNumberOfDevelopers || usage
  const [licenseRange, setLicensesRange] = useState<{
    min: number
    max: number
    stepSize: number
    labelStepSize: number
  }>({ min: 1, max: 300, stepSize: 50, labelStepSize: 300 })

  useEffect(() => {
    // TODO: get tier from prices api call
    setLicensesRange({
      min: 0,
      max: 300,
      stepSize: 50,
      labelStepSize: 50
    })
    setValue(0)
  }, [newPlan])

  const rangeArray = React.useMemo((): number[] => {
    return generateRangeArray(0, 300)
  }, [])
  const selectedNumberOfDevelopers = rangeArray.findIndex((num: number) => num === numberOfDevelopers)
  const setValue = (newValue: number): void => {
    const valueFromRange = rangeArray[newValue]
    setNumberOfDevelopers(valueFromRange)
  }

  return (
    <Card>
      <Layout.Vertical>
        <Header unitPrice={unitPrice} module={'ci'} />
        <SliderBar
          min={0}
          max={300}
          stepSize={50}
          labelStepSize={50}
          value={selectedNumberOfDevelopers === -1 ? licenseRange.min : selectedNumberOfDevelopers}
          inputValue={
            selectedNumberOfDevelopers === -1 ? rangeArray[licenseRange.min] : rangeArray[selectedNumberOfDevelopers]
          }
          setValue={setValue}
        />
        <br />
        <DeveloperSubscriptionInfo
          recommended={recommended}
          currentSubscribed={currentSubscribed}
          usage={usage}
          currentPlan={currentPlan}
        />
      </Layout.Vertical>
    </Card>
  )
}

export default CIDeveloperCard
