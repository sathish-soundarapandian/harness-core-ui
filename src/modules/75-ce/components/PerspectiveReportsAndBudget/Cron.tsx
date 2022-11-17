/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    |
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31, L)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, optional)

// Rules:
// [Freq]  -> [components to render]
// Daily   -> hour, min
// Weekly  -> day of week, hour, min, day of month = '?'
// Monthly -> day of month, hour, min
// Yearly  -> month, day of month, hour, min

import React, { useReducer, useMemo, useEffect } from 'react'
import { Container, Select, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './Cron.module.scss'

interface ISelectOption {
  label: string
  value: number
}

const getFrequencyOptions = () => {
  return [
    { label: 'Daily', value: 'day' },
    { label: 'Weekly', value: 'week' },
    { label: 'Monthly', value: 'month' },
    { label: 'Yearly', value: 'year' }
  ]
}

const getMonthOptions = (): ISelectOption[] => {
  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  return MONTHS.map((m, i) => ({ label: m, value: i + 1 }))
}

const getDaysOfWeekOptions = (): ISelectOption[] => {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return DAYS.map((d, i) => ({ label: d, value: i }))
}

const getDaysOfMonthOptions = () => {
  const DAYS_OF_MONTH_OPTIONS: ISelectOption[] = []
  for (let d = 1; d < 32; d++) {
    let suffix = ''
    switch (d) {
      case 1:
      case 21:
      case 31:
        suffix = 'st'
        break
      case 2:
      case 22:
        suffix = 'nd'
        break
      case 3:
      case 23:
        suffix = 'rd'
        break
      default:
        suffix = 'th'
        break
    }

    DAYS_OF_MONTH_OPTIONS.push({
      label: d + suffix,
      value: d
    })
  }

  return DAYS_OF_MONTH_OPTIONS
}

const getHourOptions = () => {
  const precision = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const am: ISelectOption[] = []
  const pm: ISelectOption[] = []

  precision.forEach((p, i) => {
    am.push({ label: `${p}:00 AM`, value: i }) // 12:00 AM
    am.push({ label: `${p}:30 AM`, value: i + 0.5 }) // 12:30 AM

    pm.push({ label: `${p}:00 PM`, value: i + 12 }) // 12:00 PM
    pm.push({ label: `${p}:30 PM`, value: i + 12 + 0.5 }) // 12:30 PM
  })

  return [...am, ...pm]
}

export const FREQUENCY_OPTIONS = getFrequencyOptions()
export const MONTH_OPTIONS = getMonthOptions()
export const DAYS_OF_WEEK_OPTIONS = getDaysOfWeekOptions()
export const DAYS_OF_MONTH_OPTIONS = getDaysOfMonthOptions()
export const HOUR_OPTIONS = getHourOptions()

const getMins = (h: number) => (h % Math.floor(h) > 0 ? 30 : 0)
const VALID_CRON_REGEX = /^((\d{1,2}|\*)\s){2}(\*|\?|\d{1,2})\s(\d{1,2}|\*)\s(\d{1,2}|\*|\?)$/
const CRON_TYPE: Record<string, RegExp> = {
  minute: /^(\*\s){4}\*$/, // "* * * * *"
  hour: /^\d{1,2}\s(\*\s){3}\*$/, // "? * * * *"
  day: /^(\d{1,2}\s){2}(\*|\?)\s(\*\s)(\*|\?)$/, // "a b * * ?"
  week: /^((\d{1,2}|\*)\s){2}(\*|\?)\s(\*\s)\d{1,2}$/, // "a b * * c"
  month: /^((\d{1,2}|\*)\s){2}\d{1,2}\s\*\s(\?|\*)$/, // "a b c * ?"
  year: /^(\d{1,2}\s){4}(\?|\*)$/ // "a b c d ?"
}

const getCronType = (cron: string): void | string => {
  if (typeof cron !== 'string' || !VALID_CRON_REGEX.test(cron)) {
    return
  }

  // Structure: [mins, hours, dayOfMonth, month, dayOfWeek]
  const minval = [0, 0, 1, 1, 0]
  const maxval = [59, 23, 31, 12, 6]
  const cronParts = cron.split(' ')

  for (let i = 0; i < cronParts.length; i++) {
    const unit = cronParts[i]
    if (unit === '*' || unit === '?') continue

    const value = parseInt(unit)
    if (value <= maxval[i] && value >= minval[i]) {
      continue
    }

    return
  }

  for (const type in CRON_TYPE) {
    if (CRON_TYPE[type].test(cron)) {
      return type
    }
  }
}

// check if dayOfWeek is in 'SUN', 'MON' format,
// If yes, convert it to 0, 1, etc. Our cron component doesn't
// support it. We support numbers only.
// This may be needed for legacy cron values/backward compat
const replaceDayOfWeek = (cron: string) => {
  const weekdayToNums: Record<string, string> = {
    SUN: '0',
    MON: '1',
    TUE: '2',
    WED: '3',
    THU: '4',
    FRI: '5',
    SAT: '6'
  }

  const weekdays = Object.keys(weekdayToNums)
  const parts = cron.split(' ')
  const dayOfWeek = parts.pop()

  if (!weekdays.includes(dayOfWeek!)) {
    return cron
  }

  return parts.concat(weekdayToNums[dayOfWeek!]).join(' ')
}

export enum ACTIONS {
  FREQUENCY,
  MONTH,
  DAY_OF_MONTH,
  DAY_OF_WEEK,
  HOURS
}

interface Action {
  type: ACTIONS
  data: unknown
}

interface IState {
  frequency: string // monthly, weekly, ..
  month: number // Jan(1), Feb(2), ..
  dayOfMonth: number // 1st(1), 2nd(2), ..
  dayOfWeek: number // Mon(0), Tue(1), ...
  hours: number // 12:00 AM (0), 5:30 PM (17.5), ..
}

const initialState: IState = {
  frequency: 'week',
  month: 1,
  dayOfWeek: 1,
  dayOfMonth: 1,
  hours: 0
}

const reducer = (state: IState, action: Action) => {
  const { type, data } = action

  switch (type) {
    case ACTIONS.FREQUENCY:
      return {
        ...state,
        ...initialState, // reset other values
        frequency: data as string
      }

    case ACTIONS.DAY_OF_WEEK:
      return { ...state, dayOfWeek: data as number }

    case ACTIONS.HOURS:
      return { ...state, hours: data as number }

    case ACTIONS.DAY_OF_MONTH:
      return { ...state, dayOfMonth: data as number }

    case ACTIONS.MONTH:
      return { ...state, month: data as number }

    default:
      return state
  }
}

const getInitialState = (cron: string): IState => {
  cron = replaceDayOfWeek(cron)
  const frequency = getCronType(cron)
  if (!cron || !frequency) {
    return initialState
  }

  const c = cron.split(' ')
  const mins = c[0],
    hrs = +c[1],
    dom = +c[2],
    month = +c[3],
    dow = +c[4]

  return {
    frequency,
    month: month as unknown as number,
    dayOfMonth: dom as unknown as number,
    dayOfWeek: dow as unknown as number,
    hours: mins === '30' ? hrs + 0.5 : hrs
  }
}

interface useCronReturnType {
  state: IState
  dispatch: React.Dispatch<Action>
  cron: string
}

export const useCron = (initialCron: string): useCronReturnType => {
  const [state, dispatch] = useReducer(
    reducer,
    useMemo(() => getInitialState(initialCron), [])
  )
  const { frequency, month, dayOfWeek, dayOfMonth, hours } = state

  let mins, hrs, day, mon, dow
  mins = hrs = day = mon = '*'
  dow = '?'

  switch (frequency) {
    case 'year':
      mins = getMins(hours)
      hrs = Math.floor(hours)
      day = dayOfMonth
      mon = month
      break
    case 'month':
      mins = getMins(hours)
      hrs = Math.floor(hours)
      day = dayOfMonth
      break
    case 'week':
      mins = getMins(hours)
      hrs = Math.floor(hours)
      dow = dayOfWeek
      day = '?'
      break
    case 'day':
      mins = getMins(hours)
      hrs = Math.floor(hours)
      break
    default:
      break
  }

  return {
    state,
    dispatch,
    cron: [mins, hrs, day, mon, dow].join(' ')
  }
}

interface CronProps {
  onChange: (cron: string) => void
  cron: string
}

const Cron = (props: CronProps) => {
  const { getString } = useStrings()
  const { state, dispatch, cron } = useCron(props.cron)

  useEffect(() => {
    props.onChange(cron)
  }, [cron])

  const handleChange = (actionType: ACTIONS, data: unknown) => {
    dispatch({ type: actionType, data })
  }

  const MonthComp = (
    <>
      <Text inline>{getString('common.in')} </Text>
      <Select
        className={css.selectBox}
        value={MONTH_OPTIONS.find(op => op.value === state.month)}
        onChange={({ value }) => handleChange(ACTIONS.MONTH, value)}
        items={MONTH_OPTIONS}
      />
    </>
  )

  const DaysOfMonthComp = (
    <>
      <Text inline>{getString('common.on')} </Text>
      <Select
        className={css.selectBox}
        value={DAYS_OF_MONTH_OPTIONS.find(op => op.value === state.dayOfMonth)}
        onChange={({ value }) => handleChange(ACTIONS.DAY_OF_MONTH, value)}
        items={DAYS_OF_MONTH_OPTIONS}
      />
    </>
  )

  const DaysOfWeekComp = (
    <>
      <Text inline>{getString('common.on')} </Text>
      <Select
        className={css.selectBox}
        value={DAYS_OF_WEEK_OPTIONS.find(op => op.value === state.dayOfWeek)}
        onChange={({ value }) => handleChange(ACTIONS.DAY_OF_WEEK, value)}
        items={DAYS_OF_WEEK_OPTIONS}
      />
    </>
  )

  const HoursComp = (
    <>
      <Text inline>{getString('common.at')} </Text>
      <Select
        className={css.selectBox}
        value={HOUR_OPTIONS.find(op => op.value === state.hours)}
        items={HOUR_OPTIONS}
        onChange={({ value }) => handleChange(ACTIONS.HOURS, value)}
      />
    </>
  )

  const frequencyToComponents: Record<string, React.ReactNode[]> = {
    year: [MonthComp, DaysOfMonthComp, HoursComp],
    month: [DaysOfMonthComp, HoursComp],
    week: [DaysOfWeekComp, HoursComp],
    day: [HoursComp]
  }

  const comps = frequencyToComponents[state.frequency] || [DaysOfWeekComp, HoursComp]
  return (
    <Container className={css.cron}>
      <Select
        value={FREQUENCY_OPTIONS.find(op => op.value === state.frequency)}
        onChange={({ value }) => handleChange(ACTIONS.FREQUENCY, value)}
        items={FREQUENCY_OPTIONS}
      />
      <div className={css.comps}>{comps.map(comp => comp)}</div>
    </Container>
  )
}

export default Cron
