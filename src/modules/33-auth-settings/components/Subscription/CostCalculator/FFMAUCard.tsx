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
import { Editions, TimeType } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
import { Item } from './FFDeveloperCard'
import SliderBar from './SliderBar'
import css from './CostCalculator.module.scss'

const MILLION = 1000000
const THOUSAND = 1000
const NUMBER_UNITS: { [key: string]: string } = {
  MILLION: 'M',
  THOUSAND: 'K'
}
const getUnitWithNumbers = (num: number): string => {
  let unit = ''
  if (num >= MILLION) {
    unit = `${num / MILLION}${NUMBER_UNITS.MILLION}`
  } else if (num >= THOUSAND) {
    unit = `${num / THOUSAND}${NUMBER_UNITS.THOUSAND}`
  } else {
    unit = `${num}`
  }
  return unit
}

const Header: React.FC<{ unitPrice: number; paymentFreq: TimeType }> = () => {
  const { getString } = useStrings()
  // const mauUnitDecr =
  //   paymentFreq === TimeType.MONTHLY
  //     ? `${getString('authSettings.costCalculator.mau.perkMau')} ${getString(
  //         'authSettings.costCalculator.mau.kMauFree'
  //       )}`
  //     : `${getString('authSettings.costCalculator.mau.permMau')} ${getString(
  //         'authSettings.costCalculator.mau.mMauFree'
  //       )}`
  // const unitPriceDescr = `${getString('authSettings.unitPrice')}: ${getAmountInCurrency(
  //   CurrencyType.USD,
  //   unitPrice
  // )} ${mauUnitDecr}`
  return (
    <Layout.Vertical padding={{ bottom: 'medium' }}>
      <Text font={{ variation: FontVariation.H5 }}>{getString('authSettings.costCalculator.mau.title')}</Text>
      {/* <Layout.Horizontal spacing={'small'}>
        <Text
          color={Color.PRIMARY_7}
          tooltip={getString('authSettings.costCalculator.mau.mauDefinition')}
          font={{ size: 'xsmall' }}
        >
          {getString('authSettings.costCalculator.mau.mau')}
        </Text> */}
      {/* <Text font={{ size: 'xsmall' }}>{unitPriceDescr}</Text> */}
      {/* </Layout.Horizontal> */}
    </Layout.Vertical>
  )
}

interface MAUSubscriptionInfoProps {
  currentSubscribed: number
  usage: number
  currentPlan: Editions
  recommended: number
}

const MAUSubscriptionInfo: React.FC<MAUSubscriptionInfoProps> = ({
  currentSubscribed,
  usage,
  currentPlan,
  recommended
}) => {
  const { getString } = useStrings()
  const currentPlanDescr = (
    <Layout.Horizontal spacing={'small'} flex={{ alignItems: 'baseline', justifyContent: 'start' }}>
      <Text font={{ weight: 'bold' }}>{getUnitWithNumbers(currentSubscribed)}</Text>
      <Text color={Color.PRIMARY_7} font={{ size: 'xsmall', weight: 'bold' }}>
        {`${capitalize(currentPlan)} ${getString('common.subscriptions.overview.plan')}`}
      </Text>
    </Layout.Horizontal>
  )

  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between' }} className={css.subscriptionInfo}>
      <Item title={getString('authSettings.costCalculator.currentSubscribed')} value={currentPlanDescr} />
      <Item
        title={getString('authSettings.costCalculator.using')}
        value={<Text font={{ weight: 'bold' }}>{getUnitWithNumbers(usage)}</Text>}
      />
      <Item
        title={getString('authSettings.recomendation')}
        value={
          <Text color={Color.PRIMARY_7} font={{ weight: 'bold' }}>
            {getUnitWithNumbers(recommended)}
          </Text>
        }
      />
    </Layout.Horizontal>
  )
}

interface FFMAUCardProps {
  unitPrice: number
  currentSubscribed: number
  usage: number
  currentPlan: Editions
  newPlan: Editions
  selectedNumberOfMAUs?: number
  paymentFreq: TimeType
  setNumberOfMAUs: (value: number) => void
  unit?: string
  minValue: number
  sampleMultiplier?: number
  recommended: number
  getRecommendedNumbers: (recommeneded: number, sampleMultiplier: number, valuesArray: number[]) => number
}

const TEAM_MAU_LIST = [100, 200, 300, 400, 500]
const ENTERPRISE_MAU_LIST = [1, 5, 10, 15, 20]

const FFMAUCard: React.FC<FFMAUCardProps> = ({
  unitPrice,
  currentSubscribed,
  usage,
  currentPlan,
  newPlan,
  selectedNumberOfMAUs,
  setNumberOfMAUs,
  paymentFreq,
  minValue,
  unit,
  sampleMultiplier = 0,
  recommended,
  getRecommendedNumbers
}) => {
  const numberOfMAUs = selectedNumberOfMAUs || usage
  const [mausRange, setMausRange] = useState<{
    min: number
    max: number
    stepSize: number
    labelStepSize: number
    list: number[]
    unit: string
  }>({
    min: defaultTo(minValue, 0),
    max: 0,
    stepSize: 1,
    labelStepSize: 1,
    list: [],
    unit: defaultTo(unit, '')
  })

  useEffect(() => {
    if (Number.isInteger(minValue)) {
      setNumberOfMAUs(minValue)
      setMausRange({ ...mausRange, min: minValue })
    }
  }, [minValue])

  useEffect(() => {
    if (newPlan === Editions.TEAM) {
      setMausRange({
        min: 0,
        max: 4,
        stepSize: 1,
        labelStepSize: 1,
        list: TEAM_MAU_LIST,
        unit: defaultTo(unit, '')
      })
    } else {
      setMausRange({
        min: 0,
        max: 4,
        stepSize: 1,
        labelStepSize: 1,
        list: ENTERPRISE_MAU_LIST,
        unit: defaultTo(unit, '')
      })
    }
  }, [newPlan])
  const setMaus = (val: number): void => {
    const finalValue = mausRange.list[val]
    setNumberOfMAUs(finalValue)
  }
  const recommendedValue = getRecommendedNumbers(recommended, sampleMultiplier, mausRange.list)
  const selectedValue = mausRange.list.findIndex((num: number) => num === numberOfMAUs)
  return (
    <Card>
      <Layout.Vertical>
        <Header unitPrice={unitPrice} paymentFreq={paymentFreq} />
        <MAUSubscriptionInfo
          currentSubscribed={currentSubscribed}
          usage={usage === 0 ? usage : usage / defaultTo(sampleMultiplier, 1)}
          currentPlan={currentPlan}
          recommended={recommendedValue}
        />
        <SliderBar
          min={mausRange.min}
          max={mausRange.max}
          stepSize={mausRange.stepSize}
          labelStepSize={mausRange.labelStepSize}
          list={mausRange.list}
          value={selectedValue === -1 ? mausRange.min : selectedValue}
          setValue={setMaus}
          unit={mausRange.unit}
          inputValue={selectedValue === -1 ? mausRange.list[mausRange.min] : mausRange.list[selectedValue]}
          labelRenderer={(value: number) => {
            return `${mausRange.list[value]}`
          }}
        />
      </Layout.Vertical>
    </Card>
  )
}

export default FFMAUCard
