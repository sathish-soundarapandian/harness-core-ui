/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SelectOption } from '@wings-software/uicore'
import { TimeSelect } from '@common/components'
import { useStrings } from 'framework/strings'
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown'
import Expression from '../Expression/Expression'
import Spacer from '../Spacer/Spacer'
import { getUpdatedExpression, getMilitaryHours } from '../utils'
import css from './DailyTab.module.scss'

interface DailyTabInterface {
  formikProps: any
}

export default function DailyTab(props: DailyTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { minutes, hours, amPm, expression },
      values
    },
    formikProps
  } = props
  const { getString } = useStrings()

  return (
    <div className={css.dailyTab}>
      <TimeSelect
        label={getString('triggers.schedulePanel.runDailyAt')}
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
        hideSeconds={true}
      />
      <Spacer paddingTop={'var(--spacing-large)'} />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES, ActiveInputs.HOURS]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  )
}
