/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Slider } from '@blueprintjs/core'
import { Layout, Text, TextInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetUsageAndLimit } from '@common/hooks/useGetUsageAndLimit'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import css from './CostCalculator.module.scss'

const SliderWrapper = ({
  min,
  max,
  stepSize,
  value,
  onChange
}: {
  min: number
  max: number
  stepSize: number
  value: number
  onChange: (value: number) => void
}): React.ReactElement => {
  return (
    <Slider
      className={css.slider}
      min={min}
      max={max}
      stepSize={stepSize}
      value={value}
      onChange={onChange}
      labelStepSize={stepSize}
    />
  )
}

const SliderBar = ({
  title,
  min,
  max,
  stepSize,
  value,
  setValue,
  unit
}: {
  title: string
  min: number
  max: number
  stepSize: number
  value: number
  setValue: (value: number) => void
  unit?: string
}): React.ReactElement => {
  return (
    <Layout.Vertical width={'50%'} padding={{ right: 'xlarge' }}>
      <Text font={{ weight: 'bold' }}>{title}</Text>
      <Layout.Horizontal spacing={'large'}>
        <SliderWrapper min={min} max={max} stepSize={stepSize} value={value} onChange={setValue} />
        <div className={css.textInput}>
          <TextInput
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(Number(e.target.value))}
            value={value.toString()}
          />
          {unit && <span className={css.unit}>{unit}</span>}
        </div>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
export const FFNewSubscription = (): React.ReactElement => {
  const { getString } = useStrings()

  const { usageData } = useGetUsageAndLimit(ModuleName.CF)
  const { usage } = usageData
  const activeLicenses = usage?.ff?.activeFeatureFlagUsers?.count || 0
  const activeMAUs = usage?.ff?.activeClientMAUs?.count || 0

  const [licenses, setLicenses] = useState<number>(activeLicenses)
  const [maus, setMaus] = useState<number>(activeMAUs)

  const isLoading = usageData.loadingUsage

  if (isLoading) {
    return <ContainerSpinner />
  }

  return (
    <Layout.Horizontal>
      <SliderBar
        title={getString('authSettings.costCalculator.developerLicenses')}
        // TODO: get tier from prices
        min={0}
        max={50}
        stepSize={10}
        value={licenses}
        setValue={setLicenses}
      />
      <SliderBar
        title={getString('authSettings.costCalculator.maus')}
        // TODO: get tier from prices
        min={0}
        max={500}
        stepSize={100}
        value={maus}
        setValue={setMaus}
        unit={'K'}
      />
    </Layout.Horizontal>
  )
}
