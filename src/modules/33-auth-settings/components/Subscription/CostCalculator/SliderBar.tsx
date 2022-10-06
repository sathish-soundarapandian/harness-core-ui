/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Slider } from '@blueprintjs/core'
import { DropDown, Layout, TextInput, SelectOption } from '@harness/uicore'
import css from './CostCalculator.module.scss'

interface SliderWrapperProps {
  min: number
  max: number
  stepSize: number
  labelStepSize: number
  value: number
  onChange: (value: number) => void
  labelRenderer?: (value: number) => string | JSX.Element
}
const SliderWrapper: React.FC<SliderWrapperProps> = ({
  min,
  max,
  stepSize,
  labelStepSize,
  value,
  onChange,
  labelRenderer
}) => {
  return (
    <Slider
      className={css.slider}
      min={min}
      max={max}
      stepSize={stepSize}
      value={value}
      onChange={onChange}
      labelStepSize={labelStepSize}
      labelRenderer={labelRenderer}
    />
  )
}

interface SliderBarProps {
  min: number
  max: number
  stepSize: number
  labelStepSize: number
  list?: number[]
  value: number
  setValue: (value: number) => void
  unit?: string
  labelRenderer?: (value: number) => string | JSX.Element
  inputValue?: number
}

const SliderBar: React.FC<SliderBarProps> = ({
  min,
  max,
  stepSize,
  labelStepSize,
  list,
  value,
  inputValue,
  setValue,
  unit,
  labelRenderer
}) => {
  const dropdownList = React.useMemo(() => {
    return (
      list?.reduce((accumulator: SelectOption[], current) => {
        accumulator.push({
          label: `${current.toString()}${unit}`,
          value: current + ''
        } as SelectOption)
        return accumulator
      }, []) || []
    )
  }, [list, unit])
  const updateFromDropdown = (val: number): void => {
    const valueIndex = list?.indexOf(val)
    setValue(valueIndex as number)
  }
  return (
    <Layout.Horizontal spacing={'large'}>
      <SliderWrapper
        labelRenderer={labelRenderer}
        min={min}
        max={max}
        stepSize={stepSize}
        value={value}
        onChange={newValue => {
          setValue(newValue)
        }}
        labelStepSize={labelStepSize}
      />
      {list ? (
        <DropDown
          buttonTestId="slider-dropdown"
          filterable={false}
          width={70}
          items={dropdownList}
          value={defaultTo(inputValue, value).toString()}
          onChange={selected => {
            updateFromDropdown(Number(selected.value))
          }}
          placeholder={`  ${unit}`}
          className={css.dropdown}
        />
      ) : (
        <TextInput
          data-testid="slider-input"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val = Math.abs(Number(e.target.value))
            const maxValue = Math.abs(Number(max))
            return setValue(val > maxValue ? maxValue : val)
          }}
          value={defaultTo(inputValue, value).toString()}
          className={css.textInput}
        />
      )}
    </Layout.Horizontal>
  )
}

export default SliderBar
