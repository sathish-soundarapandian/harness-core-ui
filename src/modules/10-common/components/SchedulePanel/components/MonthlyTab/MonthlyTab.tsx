/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, SelectOption, FormInput, Text } from '@wings-software/uicore'
import { Toothpick, TimeSelect } from '@common/components'
import { useStrings } from 'framework/strings'
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown'
import Expression from '../Expression/Expression'
import Spacer from '../Spacer/Spacer'
import {
  oneTwelveOptions,
  nthDayOptions,
  monthOptions,
  getUpdatedExpression,
  getMilitaryHours,
  getSlashValue,
  getDayOptionsToMonth,
  defaultMonthlyValues
} from '../utils'
import css from './MonthlyTab.module.scss'

interface MonthlyTabInterface {
  formikProps: any
  hideSeconds: boolean
}

export default function MonthlyTab(props: MonthlyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { dayOfMonth, month, minutes, startMonth, hours, amPm, expression, selectedScheduleTab },
      values
    },
    formikProps,
    hideSeconds
  } = props
  const { getString } = useStrings()

  return (
    <div className={css.monthlyTab}>
      <Layout.Vertical>
        <Text className={css.label}> {getString('common.schedulePanel.runOnSpecificDay')}</Text>
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center', marginBottom: 'var(--spacing-medium)' }}>
          <Text className={css.label}>{getString('common.schedulePanel.startingWith')}</Text>
          <FormInput.Select
            className={css.selectMonth}
            name="startMonth"
            items={monthOptions}
            onChange={option => {
              const dayOfMonthResetExpression = getUpdatedExpression({
                expression,
                value: getSlashValue({
                  selectedScheduleTab,
                  id: 'dayOfMonth',
                  value: defaultMonthlyValues.dayOfMonth
                }),
                id: 'dayOfMonth'
              })
              formikProps.setValues({
                ...values,
                startMonth: option.value,
                dayOfMonth: defaultMonthlyValues.dayOfMonth,
                expression: getUpdatedExpression({
                  expression: dayOfMonthResetExpression,
                  value: getSlashValue({
                    selectedScheduleTab,
                    id: 'month',
                    startMonth: option.value as string,
                    value: month
                  }),
                  id: 'month'
                })
              })
            }}
          />
          <Text className={css.label}>
            {', '}
            {getString('common.schedulePanel.onThe')}
          </Text>
          <Toothpick
            startValue={dayOfMonth}
            handleStartValueChange={option =>
              formikProps.setValues({
                ...values,
                dayOfMonth: option.value,
                expression: getUpdatedExpression({
                  expression,
                  value: option.value as string,
                  id: 'dayOfMonth'
                })
              })
            }
            endValue={month}
            handleEndValueChange={option =>
              formikProps.setValues({
                ...values,
                month: option.value,
                expression: getUpdatedExpression({
                  expression,
                  value: getSlashValue({ selectedScheduleTab, id: 'month', startMonth, value: option.value as string }),
                  id: 'month'
                })
              })
            }
            startOptions={getDayOptionsToMonth({ monthNo: startMonth, options: nthDayOptions })}
            endOptions={oneTwelveOptions}
            adjoiningText={getString('common.schedulePanel.ofEvery')}
            endingText={getString('common.schedulePanel.monthsParentheses')}
          />
        </Layout.Horizontal>
        <TimeSelect
          label={getString('common.schedulePanel.runAt')}
          hoursValue={hours}
          minutesValue={minutes}
          amPmValue={amPm}
          handleHoursSelect={(option: SelectOption) =>
            formikProps.setValues({
              ...values,
              hours: option.value,
              expression: getUpdatedExpression({
                expression,
                value: getMilitaryHours({ hours: option.value as string, amPm }),
                id: 'hours'
              })
            })
          }
          handleMinutesSelect={(option: SelectOption) =>
            formikProps.setValues({
              ...values,
              minutes: option.value,
              expression: getUpdatedExpression({ expression, value: option.value as string, id: 'minutes' })
            })
          }
          handleAmPmSelect={(option: SelectOption) => {
            const newHours = getMilitaryHours({ hours: values.hours, amPm: option.value as string })
            formikProps.setValues({
              ...values,
              amPm: option.value,
              expression: getUpdatedExpression({ expression, value: newHours, id: 'hours' })
            })
          }}
          hideSeconds={hideSeconds}
        />
        <Spacer paddingTop="var(--spacing-large)" />
        <ExpressionBreakdown
          formikValues={values}
          activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS, ActiveInputs.DAY_OF_MONTH, ActiveInputs.MONTH]}
        />
        <Spacer />
        <Expression formikProps={formikProps} />
      </Layout.Vertical>
    </div>
  )
}
