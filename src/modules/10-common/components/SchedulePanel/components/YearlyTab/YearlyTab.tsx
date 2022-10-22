/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, SelectOption } from '@wings-software/uicore'
import { Toothpick, TimeSelect } from '@common/components'
import { useStrings } from 'framework/strings'
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown'
import Expression from '../Expression/Expression'
import Spacer from '../Spacer/Spacer'
import {
  monthOptions,
  nthDayOptions,
  getUpdatedExpression,
  getMilitaryHours,
  getDayOptionsToMonth,
  defaultYearlyValues
} from '../utils'
import css from './YearlyTab.module.scss'

interface YearlyTabInterface {
  formikProps: any
  hideSeconds: boolean
}

export default function YearlyTab(props: YearlyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { dayOfMonth, month, minutes, hours, amPm, expression },
      values
    },
    formikProps,
    hideSeconds
  } = props
  const { getString } = useStrings()

  return (
    <div className={css.yearlyTab}>
      <Layout.Vertical>
        <Toothpick
          label={getString('common.schedulePanel.runOnSpecificDayMonth')}
          startValue={month}
          handleStartValueChange={option => {
            const dayOfMonthResetExpression = getUpdatedExpression({
              expression,
              value: defaultYearlyValues.dayOfMonth,
              id: 'dayOfMonth'
            })
            formikProps.setValues({
              ...values,
              month: option.value,
              dayOfMonth: defaultYearlyValues.dayOfMonth,
              expression: getUpdatedExpression({
                expression: dayOfMonthResetExpression,
                value: option.value as string,
                id: 'month'
              })
            })
          }}
          endValue={dayOfMonth}
          handleEndValueChange={option =>
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
          startOptions={monthOptions}
          endOptions={getDayOptionsToMonth({ monthNo: month, options: nthDayOptions })}
          adjoiningText={getString('common.schedulePanel.onThe')}
        />
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
