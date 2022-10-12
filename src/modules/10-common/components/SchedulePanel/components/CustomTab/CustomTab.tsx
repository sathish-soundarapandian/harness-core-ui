/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getBreakdownValues } from '../utils'
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown'
import Expression from '../Expression/Expression'
import Spacer from '../Spacer/Spacer'

interface CustomTabInterface {
  formikProps: any
  hideSeconds: boolean
}

export default function CustomTab(props: CustomTabInterface): JSX.Element {
  const {
    formikProps: { values },
    formikProps
  } = props
  const { getString } = useStrings()

  useEffect(() => {
    formikProps.validateForm()
  }, [])

  return (
    <>
      <FormInput.Text
        label={getString('common.schedulePanel.enterCustomCron')}
        name="expression"
        style={{ margin: 0 }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e?.target?.value) {
            const breakdownValues = getBreakdownValues(e.target.value)
            formikProps.setValues({ ...values, expression: e.target.value, breakdownValues })
          }
        }}
      />
      <Spacer paddingTop="var(--spacing-large)" paddingBottom="var(--spacing-large)" />
      <ExpressionBreakdown
        formikValues={values}
        activeInputs={[
          ActiveInputs.MINUTES,
          ActiveInputs.HOURS,
          ActiveInputs.DAY_OF_MONTH,
          ActiveInputs.MONTH,
          ActiveInputs.DAY_OF_WEEK
        ]}
      />
      <Spacer paddingTop="var(--spacing-large)" />
      <Expression formikProps={formikProps} />
    </>
  )
}
