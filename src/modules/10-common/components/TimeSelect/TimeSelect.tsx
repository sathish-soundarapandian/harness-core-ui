/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, SelectOption, Text, Container, Select } from '@wings-software/uicore'
import { zeroFiftyNineDDOptions, amPmOptions, oneTwelveDDOptions } from './TimeSelectUtils'
import css from './TimeSelect.module.scss'

interface TimeSelectPropsInterface {
  label?: string
  handleHoursSelect: (option: SelectOption) => void
  handleMinutesSelect: (option: SelectOption) => void
  handleSecondsSelect?: (option: SelectOption) => void
  handleAmPmSelect: (option: SelectOption) => void
  hoursValue: SelectOption | string
  minutesValue: SelectOption | string
  secondsValue?: SelectOption | string
  amPmValue: SelectOption | string
  disabled?: boolean
  className?: string
  hideSeconds: boolean
}
const getSelectValueOption = (val: string | SelectOption, options: SelectOption[]): any => {
  if (Array.isArray(val)) {
    return val
  } else if (options && val) {
    return options.find((option: SelectOption) => option.value === val)
  }
  return undefined
}

const TimeSelect: React.FC<TimeSelectPropsInterface> = props => {
  const {
    label,
    className,
    hoursValue,
    minutesValue,
    secondsValue,
    amPmValue,
    handleHoursSelect,
    handleMinutesSelect,
    handleSecondsSelect,
    handleAmPmSelect,
    hideSeconds,
    disabled
  } = props

  return (
    <Container data-name="timeselect" className={className ? className : ''}>
      {label && <Text className={css.label}>{label}</Text>}
      <Layout.Horizontal spacing="xsmall">
        <Select
          className={css.selectStyle}
          value={getSelectValueOption(hoursValue, oneTwelveDDOptions)}
          items={oneTwelveDDOptions}
          onChange={handleHoursSelect}
          disabled={disabled}
        />
        <Select
          className={css.selectStyle}
          value={getSelectValueOption(minutesValue, zeroFiftyNineDDOptions)}
          items={zeroFiftyNineDDOptions}
          onChange={handleMinutesSelect}
          disabled={disabled}
        />
        {!hideSeconds && (
          <Select
            className={css.selectStyle}
            value={secondsValue && getSelectValueOption(secondsValue, zeroFiftyNineDDOptions)}
            items={zeroFiftyNineDDOptions}
            onChange={handleSecondsSelect}
            disabled={disabled}
          />
        )}
        <Select
          className={css.selectStyle}
          value={getSelectValueOption(amPmValue, amPmOptions)}
          items={amPmOptions}
          onChange={handleAmPmSelect}
          disabled={disabled}
        />
      </Layout.Horizontal>
    </Container>
  )
}
export default TimeSelect
