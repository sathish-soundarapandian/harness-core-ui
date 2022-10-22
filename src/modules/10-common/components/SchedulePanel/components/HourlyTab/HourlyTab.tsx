/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Toothpick } from '@common/components'
import { useStrings } from 'framework/strings'
import { zeroFiftyNineDDOptions } from '@common/components/TimeSelect/TimeSelectUtils'
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown'
import Expression from '../Expression/Expression'
import Spacer from '../Spacer/Spacer'
import { cronSensicalHoursOptions, getUpdatedExpression, getSlashValue } from '../utils'
import css from './HourlyTab.module.scss'

interface HourlyTabInterface {
  formikProps: any
}

export default function HourlyTab(props: HourlyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { hours, minutes, expression, selectedScheduleTab },
      values
    },
    formikProps
  } = props
  const { getString } = useStrings()

  return (
    <div className={css.hourlyTab}>
      <Toothpick
        label={getString('common.schedulePanel.runEvery')}
        startValue={hours}
        endValue={minutes}
        startOptions={cronSensicalHoursOptions}
        handleStartValueChange={val =>
          formikProps.setValues({
            ...values,
            hours: val.value,
            expression: getUpdatedExpression({
              expression,
              value: getSlashValue({ selectedScheduleTab, id: 'hours', value: val.value as string }),
              id: 'hours'
            })
          })
        }
        endOptions={zeroFiftyNineDDOptions}
        handleEndValueChange={val =>
          formikProps.setValues({
            ...values,
            minutes: val.value,
            expression: getUpdatedExpression({ expression, value: val.value as string, id: 'minutes' })
          })
        }
        adjoiningText={getString('common.schedulePanel.hoursAnd')}
        endingText={getString('common.schedulePanel.minutesAfterTheHour')}
      />
      <Spacer paddingTop={'var(--spacing-large)'} />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  )
}
