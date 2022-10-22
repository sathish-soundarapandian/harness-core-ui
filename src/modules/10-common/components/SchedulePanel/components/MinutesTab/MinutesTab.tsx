/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Text, Layout } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import ExpressionBreakdown, { ActiveInputs } from '../ExpressionBreakdown/ExpressionBreakdown'
import Expression from '../Expression/Expression'
import Spacer from '../Spacer/Spacer'
import { cronSensicalMinutesOptions, getUpdatedExpression, getSlashValue } from '../utils'
import css from './MinutesTab.module.scss'

interface MinutesTabInterface {
  formikProps: any
}

export default function MinutesTab(props: MinutesTabInterface): JSX.Element {
  const {
    formikProps: {
      values: { expression, selectedScheduleTab },
      values
    },
    formikProps
  } = props
  const { getString } = useStrings()

  return (
    <div className={css.minutesTab}>
      <Text className={css.label}>{getString('common.schedulePanel.runEvery')}</Text>
      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
        <FormInput.Select
          name="minutes"
          items={cronSensicalMinutesOptions}
          placeholder="Select"
          onChange={option => {
            formikProps.setValues({
              ...values,
              minutes: option.value,
              expression: getUpdatedExpression({
                expression,
                value: getSlashValue({ selectedScheduleTab, id: 'minutes', value: option.value as string }),
                id: 'minutes'
              })
            })
          }}
        />
        <Text style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.GREY_800}>
          {getString('common.schedulePanel.minutesParentheses')}
        </Text>
      </Layout.Horizontal>
      <Spacer paddingTop="var(--spacing-xsmall)" />
      <ExpressionBreakdown formikValues={values} activeInputs={[ActiveInputs.MINUTES]} />
      <Spacer />
      <Expression formikProps={formikProps} />
    </div>
  )
}
