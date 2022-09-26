/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { capitalize, defaultTo } from 'lodash-es'
import { Card, Layout, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { Editions } from '@common/constants/SubscriptionTypes'
import SliderBar from './SliderBar'
import css from './CostCalculator.module.scss'

export const generateRangeArray = (min: number, max: number, stepSize: number): number[] => {
  const rangeArray = []
  for (let i = min; i <= max; i += stepSize) {
    rangeArray.push(i)
  }
  return rangeArray
}

const Header: React.FC<{ unitPrice: number }> = () => {
  const { getString } = useStrings()
  // const unitPriceDescr = `${getString('authSettings.unitPrice')}: ${getAmountInCurrency(
  //   CurrencyType.USD,
  //   unitPrice
  // )} ${getString('common.perDeveloper')} ${getString('common.perMonth')}`
  return (
    <Layout.Vertical padding={{ bottom: 'medium' }}>
      <Text font={{ variation: FontVariation.H5 }}>{getString('authSettings.costCalculator.developer.title')}</Text>
      <Layout.Horizontal spacing={'small'}>
        <Text
          color={Color.PRIMARY_7}
          tooltip={getString('authSettings.costCalculator.developer.developerDefinition')}
          font={{ size: 'xsmall' }}
        >
          {getString('authSettings.costCalculator.developer.developer')}
        </Text>
        {/* <Text font={{ size: 'xsmall' }}>{unitPriceDescr}</Text> */}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

interface DeveloperSubscriptionInfoProps {
  currentSubscribed: number
  usage: number
  currentPlan: Editions
  recommended: number | null
}

export const Item: React.FC<{ title: string; value: React.ReactElement }> = ({ title, value }) => {
  return (
    <Layout.Vertical spacing={'medium'}>
      <Text>{title}</Text>
      {value}
    </Layout.Vertical>
  )
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
      <Item title={getString('authSettings.costCalculator.currentSubscribed')} value={currentPlanDescr} />
      <Item
        title={getString('authSettings.costCalculator.using')}
        value={<Text font={{ weight: 'bold' }}>{usage}</Text>}
      />
      <Item
        title={getString('authSettings.recomendation')}
        value={
          <Text color={Color.PRIMARY_7} font={{ weight: 'bold' }}>
            {recommendedNumber}
          </Text>
        }
      />
    </Layout.Horizontal>
  )
}

interface FFDeveloperCardProps {
  unitPrice: number
  currentSubscribed: number
  usage: number
  currentPlan: Editions
  newPlan: Editions
  toggledNumberOfDevelopers?: number
  setNumberOfDevelopers: (value: number) => void
  recommended: number | null
}

const FFDeveloperCard: React.FC<FFDeveloperCardProps> = ({
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
  }>({ min: 1, max: 0, stepSize: 1, labelStepSize: 1 })

  useEffect(() => {
    // TODO: get tier from prices api call
    if (newPlan === Editions.TEAM) {
      setLicensesRange({
        min: 0,
        max: 50,
        stepSize: 1,
        labelStepSize: 10
      })
      setValue(0)
    } else {
      setLicensesRange({
        min: 0,
        max: 25,
        stepSize: 1,
        labelStepSize: 25
      })
      setValue(0)
    }
  }, [newPlan])

  const rangeArray = React.useMemo((): number[] => {
    if (newPlan === Editions.TEAM) {
      return generateRangeArray(0, 50, 1)
    } else {
      return generateRangeArray(25, 50, 1)
    }
  }, [newPlan])
  const selectedNumberOfDevelopers = rangeArray.findIndex((num: number) => num === numberOfDevelopers)
  const setValue = (newValue: number): void => {
    const valueFromRange = rangeArray[newValue]
    setNumberOfDevelopers(valueFromRange)
  }
  return (
    <Card>
      <Layout.Vertical>
        <Header unitPrice={unitPrice} />
        <DeveloperSubscriptionInfo
          recommended={recommended}
          currentSubscribed={currentSubscribed}
          usage={usage}
          currentPlan={currentPlan}
        />
        <SliderBar
          min={licenseRange.min}
          max={licenseRange.max}
          stepSize={licenseRange.stepSize}
          labelStepSize={licenseRange.labelStepSize}
          value={selectedNumberOfDevelopers === -1 ? licenseRange.min : selectedNumberOfDevelopers}
          inputValue={
            selectedNumberOfDevelopers === -1 ? rangeArray[licenseRange.min] : rangeArray[selectedNumberOfDevelopers]
          }
          setValue={setValue}
          labelRenderer={(value: number) => {
            return `${rangeArray[value]}`
          }}
        />
      </Layout.Vertical>
    </Card>
  )
}

export default FFDeveloperCard
