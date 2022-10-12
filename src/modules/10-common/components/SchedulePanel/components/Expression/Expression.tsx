/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Container, HarnessDocTooltip } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { scheduleTabsId, isCronValid } from '../utils'
import css from './Expression.module.scss'

interface ExpressionInterface {
  formikProps: any
}

export default function Expression(props: ExpressionInterface): JSX.Element {
  const {
    formikProps: {
      values: { expression, selectedScheduleTab }
    }
  } = props
  const { getString } = useStrings()
  const showError = selectedScheduleTab === scheduleTabsId.CUSTOM && !isCronValid(expression)
  return (
    <Container data-name="expression" className={css.expression}>
      <Text className={css.label} data-tooltip-id="cronExpression">
        {getString('common.schedulePanel.cronExpression')}
        <HarnessDocTooltip tooltipId="cronExpression" useStandAlone={true} />
      </Text>
      <Container className={cx(css.field, (showError && css.errorField) || '')}>
        <Text data-testid="cron-expression">{expression}</Text>
      </Container>
    </Container>
  )
}
